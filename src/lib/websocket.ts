/**
 * WebSocket Client for Real-time Gateway Updates
 * Provides live session status, message counts, and agent activity
 */

import { cache, CACHE_TTL } from './cache'
import { env } from './config'
import { Session, CronJob } from './gateway'

// WebSocket event types that the Gateway might send
export interface WebSocketEvent {
  type: 'session_update' | 'session_created' | 'session_ended' | 'message_sent' | 'cron_triggered' | 'agent_status'
  data: {
    sessionKey?: string
    session?: Session
    messageCount?: number
    cronJobId?: string
    agentId?: string
    status?: string
    timestamp: string
  }
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  lastConnected?: Date
  errorCount: number
}

export type EventHandler = (event: WebSocketEvent) => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private eventHandlers = new Map<string, EventHandler[]>()
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000 // Start with 1 second
  private heartbeatTimer: NodeJS.Timeout | null = null
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
    errorCount: 0
  }

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Connect to the Gateway WebSocket endpoint
   */
  private connect(): void {
    try {
      const gatewayUrl = env.client.NEXT_PUBLIC_GATEWAY_URL
      const gatewayToken = env.client.NEXT_PUBLIC_GATEWAY_TOKEN
      
      if (!gatewayUrl) {
        console.warn('Gateway URL not configured for WebSocket connection')
        return
      }

      // Convert HTTP URL to WebSocket URL
      const wsUrl = gatewayUrl.replace(/^https?:/, 'wss:').replace(/^http:/, 'ws:') + '/api/ws'
      
      console.log('Connecting to WebSocket:', wsUrl)
      
      this.ws = new WebSocket(wsUrl)
      this.connectionStatus.reconnecting = true

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.connectionStatus.connected = true
        this.connectionStatus.reconnecting = false
        this.connectionStatus.lastConnected = new Date()
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000

        // Send authentication if token is available
        if (gatewayToken && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'auth',
            token: gatewayToken
          }))
        }

        // Start heartbeat
        this.startHeartbeat()

        // Emit connection event
        this.emitEvent({
          type: 'agent_status',
          data: {
            status: 'connected',
            timestamp: new Date().toISOString()
          }
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data)
          this.handleEvent(wsEvent)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.connectionStatus.errorCount++
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        this.connectionStatus.connected = false
        this.stopHeartbeat()

        // Don't reconnect if it was a manual close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Handle incoming WebSocket events
   */
  private handleEvent(event: WebSocketEvent): void {
    console.log('WebSocket event received:', event)

    // Update cache based on event type
    switch (event.type) {
      case 'session_update':
        if (event.data.session) {
          // Update session in cache
          this.updateSessionInCache(event.data.session)
        }
        break
      
      case 'session_created':
        if (event.data.session) {
          // Invalidate session list cache to refresh
          cache.clearPrefix('sessions:')
        }
        break
      
      case 'session_ended':
        // Invalidate session caches
        cache.clearPrefix('sessions:')
        break
      
      case 'message_sent':
        if (event.data.sessionKey && event.data.messageCount) {
          // Update message count in session cache
          this.updateSessionMessageCount(event.data.sessionKey, event.data.messageCount)
        }
        break
      
      case 'cron_triggered':
        // Invalidate cron caches
        cache.clearPrefix('cron:')
        break
    }

    // Emit to registered handlers
    this.emitEvent(event)
  }

  /**
   * Update a specific session in the cache
   */
  private updateSessionInCache(updatedSession: Session): void {
    // Update any cached session lists
    const cacheKeys = cache.stats().keys.filter(key => key.startsWith('sessions:'))
    
    cacheKeys.forEach(cacheKey => {
      const cachedSessions = cache.get<Session[]>(cacheKey)
      if (cachedSessions) {
        const updatedSessions = cachedSessions.map(session =>
          session.key === updatedSession.key ? { ...session, ...updatedSession } : session
        )
        cache.set(cacheKey, updatedSessions, CACHE_TTL.SESSIONS)
      }
    })
  }

  /**
   * Update message count for a session
   */
  private updateSessionMessageCount(sessionKey: string, messageCount: number): void {
    const cacheKeys = cache.stats().keys.filter(key => key.startsWith('sessions:'))
    
    cacheKeys.forEach(cacheKey => {
      const cachedSessions = cache.get<Session[]>(cacheKey)
      if (cachedSessions) {
        const updatedSessions = cachedSessions.map(session =>
          session.key === sessionKey ? { ...session, messageCount } : session
        )
        cache.set(cacheKey, updatedSessions, CACHE_TTL.SESSIONS)
      }
    })
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Ping every 30 seconds
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return // Already scheduled

    this.connectionStatus.reconnecting = true
    this.reconnectAttempts++

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  /**
   * Subscribe to WebSocket events
   */
  on(eventType: WebSocketEvent['type'], handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    
    this.eventHandlers.get(eventType)!.push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * Subscribe to all WebSocket events
   */
  onAll(handler: EventHandler): () => void {
    return this.on('agent_status', handler) // Use agent_status as catch-all for now
  }

  /**
   * Emit event to registered handlers
   */
  private emitEvent(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type) || []
    handlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in WebSocket event handler:', error)
      }
    })

    // Also emit to catch-all handlers
    if (event.type !== 'agent_status') {
      const allHandlers = this.eventHandlers.get('agent_status') || []
      allHandlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error('Error in WebSocket catch-all handler:', error)
        }
      })
    }
  }

  /**
   * Manually disconnect
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.connectionStatus.connected = false
    this.connectionStatus.reconnecting = false
  }

  /**
   * Manually reconnect
   */
  reconnect(): void {
    this.disconnect()
    setTimeout(() => this.connect(), 100)
  }
}

// Singleton WebSocket manager
export const wsManager = new WebSocketManager()

/**
 * Get current WebSocket connection status
 */
export function getWebSocketStatus(): ConnectionStatus {
  return wsManager.getStatus()
}

/**
 * Subscribe to WebSocket events
 */
export function onWebSocketEvent(eventType: WebSocketEvent['type'], handler: EventHandler): () => void {
  return wsManager.on(eventType, handler)
}

/**
 * Subscribe to all WebSocket events
 */
export function onAllWebSocketEvents(handler: EventHandler): () => void {
  return wsManager.onAll(handler)
}

/**
 * Manually reconnect WebSocket
 */
export function reconnectWebSocket(): void {
  wsManager.reconnect()
}