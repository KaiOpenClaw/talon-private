/**
 * Enhanced React hooks for WebSocket integration
 * Provides easy access to real-time Gateway events with improved architecture
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { logger } from '@/lib/logger'
import type { EnhancedWebSocketEvent } from '@/lib/websocket-enhanced'

// Enhanced WebSocket connection state
export interface EnhancedWebSocketState {
  connected: boolean
  connecting: boolean
  reconnecting: boolean
  error: string | null
  lastEvent: EnhancedWebSocketEvent | null
  eventCount: number
  connectionTime: Date | null
  clientId: string | null
  serverStats: {
    totalClients: number
    eventHistory: number
  } | null
}

// Client subscription preferences
export interface WebSocketSubscription {
  eventTypes: EnhancedWebSocketEvent['type'][]
  sessionKeys?: string[]
  agentIds?: string[]
}

/**
 * Enhanced WebSocket hook with improved connection management
 */
export function useEnhancedWebSocket(
  subscription?: Partial<WebSocketSubscription>
): EnhancedWebSocketState & {
  subscribe: (newSubscription: Partial<WebSocketSubscription>) => void
  reconnect: () => void
  sendMessage: (message: any) => boolean
} {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10
  
  const [state, setState] = useState<EnhancedWebSocketState>({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null,
    lastEvent: null,
    eventCount: 0,
    connectionTime: null,
    clientId: null,
    serverStats: null
  })

  // Default subscription includes dashboard refresh events
  const defaultSubscription: WebSocketSubscription = {
    eventTypes: ['dashboard_refresh', 'system_status', 'connection_count']
  }

  const currentSubscription = useRef<WebSocketSubscription>({
    ...defaultSubscription,
    ...subscription
  })

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    setState(prev => ({ ...prev, connecting: true, error: null }))
    
    try {
      // Use the enhanced WebSocket endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws`

      // Note: This is a workaround for Next.js limitations
      // In production, you might need a separate WebSocket server
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        logger.info('Enhanced WebSocket connected', {
          component: 'useEnhancedWebSocket',
          action: 'connect',
          attempts: reconnectAttempts.current
        })

        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          reconnecting: false,
          error: null,
          connectionTime: new Date()
        }))

        reconnectAttempts.current = 0

        // Send subscription preferences
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          subscription: currentSubscription.current
        }))

        // Start heartbeat
        startHeartbeat()
      }

      ws.current.onmessage = (event) => {
        try {
          const enhancedEvent: EnhancedWebSocketEvent = JSON.parse(event.data)
          
          setState(prev => ({
            ...prev,
            lastEvent: enhancedEvent,
            eventCount: prev.eventCount + 1
          }))

          // Extract client ID and server stats from system events
          if (enhancedEvent.type === 'system_status') {
            if (enhancedEvent.data.clientId) {
              setState(prev => ({
                ...prev,
                clientId: enhancedEvent.data.clientId as string
              }))
            }

            if (enhancedEvent.data.totalClients !== undefined) {
              setState(prev => ({
                ...prev,
                serverStats: {
                  totalClients: enhancedEvent.data.totalClients as number,
                  eventHistory: enhancedEvent.data.eventHistory as number || 0
                }
              }))
            }
          }

          logger.debug('Enhanced WebSocket event received', {
            component: 'useEnhancedWebSocket',
            eventType: enhancedEvent.type,
            eventId: enhancedEvent.id,
            priority: enhancedEvent.priority
          })

        } catch (error) {
          logger.error('Failed to parse enhanced WebSocket message', {
            component: 'useEnhancedWebSocket',
            error: error instanceof Error ? error.message : String(error),
            rawData: event.data
          })
        }
      }

      ws.current.onerror = (error) => {
        logger.error('Enhanced WebSocket error', {
          component: 'useEnhancedWebSocket',
          error: String(error)
        })
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error', 
          connecting: false 
        }))
      }

      ws.current.onclose = (event) => {
        logger.info('Enhanced WebSocket closed', {
          component: 'useEnhancedWebSocket',
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })

        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }))

        stopHeartbeat()

        // Auto-reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect()
        }
      }

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection', 
        connecting: false 
      }))
      scheduleReconnect()
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) return

    setState(prev => ({ ...prev, reconnecting: true }))
    reconnectAttempts.current++

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000)
    
    logger.info(`Scheduling enhanced WebSocket reconnect`, {
      component: 'useEnhancedWebSocket',
      delay: `${delay}ms`,
      attempt: reconnectAttempts.current
    })

    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null
      connect()
    }, delay)
  }, [connect])

  const startHeartbeat = () => {
    heartbeatTimer.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
      heartbeatTimer.current = null
    }
  }

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    stopHeartbeat()

    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect')
      ws.current = null
    }

    setState(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false,
      reconnecting: false,
      connectionTime: null,
      clientId: null
    }))
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => connect(), 100)
  }, [disconnect, connect])

  const subscribe = useCallback((newSubscription: Partial<WebSocketSubscription>) => {
    currentSubscription.current = {
      ...currentSubscription.current,
      ...newSubscription
    }

    // Send updated subscription if connected
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        subscription: currentSubscription.current
      }))
    }
  }, [])

  const sendMessage = useCallback((message: any): boolean => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message))
        return true
      } catch (error) {
        logger.error('Failed to send enhanced WebSocket message', {
          component: 'useEnhancedWebSocket',
          error: error instanceof Error ? error.message : String(error)
        })
        return false
      }
    }
    return false
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    ...state,
    subscribe,
    reconnect,
    sendMessage
  }
}

/**
 * Hook for real-time session updates using enhanced WebSocket
 */
export function useRealtimeSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const webSocket = useEnhancedWebSocket({
    eventTypes: ['session_update', 'session_created', 'session_ended', 'message_sent']
  })

  useEffect(() => {
    if (webSocket.lastEvent) {
      const event = webSocket.lastEvent
      
      switch (event.type) {
        case 'session_update':
          if (event.data.sessions) {
            setSessions(event.data.sessions as any[])
            setLastUpdate(new Date())
          }
          break
        case 'session_created':
          if (event.data.session) {
            setSessions(prev => [...prev, event.data.session])
            setLastUpdate(new Date())
          }
          break
        case 'session_ended':
          if (event.data.sessionKey) {
            setSessions(prev => prev.filter(s => s.key !== event.data.sessionKey))
            setLastUpdate(new Date())
          }
          break
        case 'message_sent':
          if (event.data.sessionKey && event.data.messageCount) {
            setSessions(prev => prev.map(s => 
              s.key === event.data.sessionKey 
                ? { ...s, messageCount: event.data.messageCount }
                : s
            ))
            setLastUpdate(new Date())
          }
          break
      }
    }
  }, [webSocket.lastEvent])

  return {
    sessions,
    lastUpdate,
    ...webSocket
  }
}

/**
 * Hook for real-time cron job updates using enhanced WebSocket
 */
export function useRealtimeCronJobs() {
  const [cronJobs, setCronJobs] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [lastTriggered, setLastTriggered] = useState<string | null>(null)

  const webSocket = useEnhancedWebSocket({
    eventTypes: ['cron_updated', 'cron_triggered']
  })

  useEffect(() => {
    if (webSocket.lastEvent) {
      const event = webSocket.lastEvent
      
      switch (event.type) {
        case 'cron_updated':
          if (event.data.cronJobs) {
            setCronJobs(event.data.cronJobs as any[])
            setLastUpdate(new Date())
          }
          break
        case 'cron_triggered':
          if (event.data.cronJobId) {
            setLastTriggered(event.data.cronJobId as string)
            // Could update the specific job's last run time here
          }
          break
      }
    }
  }, [webSocket.lastEvent])

  return {
    cronJobs,
    lastUpdate,
    lastTriggered,
    ...webSocket
  }
}

/**
 * Hook for dashboard-wide real-time updates
 */
export function useRealtimeDashboard() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [activeClients, setActiveClients] = useState(0)

  const webSocket = useEnhancedWebSocket({
    eventTypes: ['dashboard_refresh', 'connection_count', 'system_status']
  })

  useEffect(() => {
    if (webSocket.lastEvent) {
      const event = webSocket.lastEvent
      
      switch (event.type) {
        case 'dashboard_refresh':
          setLastRefresh(new Date())
          break
        case 'connection_count':
          if (event.data.count !== undefined) {
            setActiveClients(event.data.count as number)
          }
          break
      }
    }
  }, [webSocket.lastEvent])

  return {
    lastRefresh,
    activeClients,
    shouldRefresh: !!lastRefresh,
    ...webSocket
  }
}