/**
 * Enhanced WebSocket System for Real-time Updates
 * Comprehensive real-time event broadcasting and client management
 */

import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { logger } from '@/lib/logger'
import type { Session, Agent, CronJob } from '@/types'

// Enhanced WebSocket event types
export interface EnhancedWebSocketEvent {
  type: 'session_update' | 'session_created' | 'session_ended' | 'message_sent' | 
        'cron_triggered' | 'cron_updated' | 'agent_status' | 'system_status' | 
        'connection_count' | 'dashboard_refresh' | 'error'
  data: {
    sessionKey?: string
    session?: Session
    sessions?: Session[]
    messageCount?: number
    cronJobId?: string
    cronJobs?: CronJob[]
    agentId?: string
    agents?: Agent[]
    status?: string
    count?: number
    error?: string
    timestamp: string
    source?: string // API endpoint that triggered the event
  }
  id: string // Unique event ID for deduplication
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface ClientSubscription {
  eventTypes: EnhancedWebSocketEvent['type'][]
  sessionKeys?: string[] // Only get updates for specific sessions
  agentIds?: string[] // Only get updates for specific agents
}

interface WebSocketClient {
  ws: WebSocket
  id: string
  subscription: ClientSubscription
  lastSeen: Date
  connectTime: Date
  eventCount: number
}

class EnhancedWebSocketManager {
  private wss: WebSocketServer | null = null
  private clients = new Map<string, WebSocketClient>()
  private eventHistory: EnhancedWebSocketEvent[] = []
  private readonly maxEventHistory = 100
  private heartbeatInterval: NodeJS.Timeout | null = null
  private metricsInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startHeartbeat()
    this.startMetricsCollection()
  }

  /**
   * Initialize WebSocket server
   */
  initialize(port?: number): WebSocketServer {
    if (this.wss) return this.wss

    this.wss = new WebSocketServer({
      port: port || 0,
      perMessageDeflate: {
        threshold: 1024,
        concurrencyLimit: 10,
        memLevel: 7,
      }
    })

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req)
    })

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error', {
        component: 'EnhancedWebSocketManager',
        error: error.message,
        stack: error.stack
      })
    })

    logger.info('Enhanced WebSocket server initialized', {
      component: 'EnhancedWebSocketManager',
      port: (this.wss.address() as any)?.port || 'dynamic'
    })

    return this.wss
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = this.generateClientId()
    const client: WebSocketClient = {
      ws,
      id: clientId,
      subscription: { eventTypes: ['dashboard_refresh'] }, // Default subscription
      lastSeen: new Date(),
      connectTime: new Date(),
      eventCount: 0
    }

    this.clients.set(clientId, client)
    
    logger.info('WebSocket client connected', {
      component: 'EnhancedWebSocketManager',
      clientId,
      totalClients: this.clients.size,
      userAgent: req.headers['user-agent']
    })

    // Send initial connection event
    this.sendToClient(clientId, {
      type: 'system_status',
      data: {
        status: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
        totalClients: this.clients.size
      },
      id: this.generateEventId(),
      priority: 'low'
    })

    // Send recent events if any
    this.sendRecentEvents(clientId)

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      this.handleClientMessage(clientId, data)
    })

    // Handle client disconnect
    ws.on('close', (code, reason) => {
      this.handleDisconnection(clientId, code, reason)
    })

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket client error', {
        component: 'EnhancedWebSocketManager',
        clientId,
        error: error.message
      })
      this.clients.delete(clientId)
    })

    // Update connection count
    this.broadcastConnectionCount()
  }

  /**
   * Handle client messages
   */
  private handleClientMessage(clientId: string, data: Buffer): void {
    const client = this.clients.get(clientId)
    if (!client) return

    try {
      const message = JSON.parse(data.toString())
      client.lastSeen = new Date()

      logger.debug('WebSocket client message', {
        component: 'EnhancedWebSocketManager',
        clientId,
        messageType: message.type,
        dataSize: data.length
      })

      // Handle different message types
      switch (message.type) {
        case 'subscribe':
          this.updateSubscription(clientId, message.subscription)
          break
        case 'ping':
          this.sendToClient(clientId, {
            type: 'system_status',
            data: {
              status: 'pong',
              timestamp: new Date().toISOString()
            },
            id: this.generateEventId(),
            priority: 'low'
          })
          break
        case 'request_history':
          this.sendRecentEvents(clientId, message.limit || 10)
          break
        default:
          logger.warn('Unknown message type from client', {
            component: 'EnhancedWebSocketManager',
            clientId,
            messageType: message.type
          })
      }

    } catch (error) {
      logger.error('Failed to parse client message', {
        component: 'EnhancedWebSocketManager',
        clientId,
        error: error instanceof Error ? error.message : String(error),
        rawData: data.toString().substring(0, 100)
      })
    }
  }

  /**
   * Update client subscription
   */
  private updateSubscription(clientId: string, subscription: Partial<ClientSubscription>): void {
    const client = this.clients.get(clientId)
    if (!client) return

    client.subscription = {
      ...client.subscription,
      ...subscription
    }

    logger.info('Client subscription updated', {
      component: 'EnhancedWebSocketManager',
      clientId,
      subscription: client.subscription
    })

    // Confirm subscription update
    this.sendToClient(clientId, {
      type: 'system_status',
      data: {
        status: 'subscription_updated',
        subscription: client.subscription,
        timestamp: new Date().toISOString()
      },
      id: this.generateEventId(),
      priority: 'low'
    })
  }

  /**
   * Send recent events to client
   */
  private sendRecentEvents(clientId: string, limit: number = 5): void {
    const recentEvents = this.eventHistory.slice(-limit)
    recentEvents.forEach(event => {
      this.sendToClient(clientId, event)
    })
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string, code: number, reason: Buffer): void {
    const client = this.clients.get(clientId)
    if (!client) return

    const duration = Date.now() - client.connectTime.getTime()

    logger.info('WebSocket client disconnected', {
      component: 'EnhancedWebSocketManager',
      clientId,
      code,
      reason: reason.toString(),
      duration: `${Math.round(duration / 1000)}s`,
      totalClients: this.clients.size - 1,
      eventsReceived: client.eventCount
    })

    this.clients.delete(clientId)
    this.broadcastConnectionCount()
  }

  /**
   * Broadcast event to all subscribed clients
   */
  broadcast(event: Omit<EnhancedWebSocketEvent, 'id'>): void {
    const enhancedEvent: EnhancedWebSocketEvent = {
      ...event,
      id: this.generateEventId()
    }

    // Add to history
    this.eventHistory.push(enhancedEvent)
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.shift()
    }

    // Send to subscribed clients
    let sentCount = 0
    this.clients.forEach((client, clientId) => {
      if (this.clientShouldReceiveEvent(client, enhancedEvent)) {
        this.sendToClient(clientId, enhancedEvent)
        sentCount++
      }
    })

    logger.debug('Event broadcasted', {
      component: 'EnhancedWebSocketManager',
      eventType: event.type,
      eventId: enhancedEvent.id,
      totalClients: this.clients.size,
      sentTo: sentCount,
      priority: event.priority || 'medium'
    })
  }

  /**
   * Check if client should receive event based on subscription
   */
  private clientShouldReceiveEvent(client: WebSocketClient, event: EnhancedWebSocketEvent): boolean {
    // Check event type subscription
    if (!client.subscription.eventTypes.includes(event.type)) {
      return false
    }

    // Check session-specific filter
    if (client.subscription.sessionKeys && event.data.sessionKey) {
      return client.subscription.sessionKeys.includes(event.data.sessionKey)
    }

    // Check agent-specific filter
    if (client.subscription.agentIds && event.data.agentId) {
      return client.subscription.agentIds.includes(event.data.agentId)
    }

    return true
  }

  /**
   * Send event to specific client
   */
  private sendToClient(clientId: string, event: EnhancedWebSocketEvent): boolean {
    const client = this.clients.get(clientId)
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      client.ws.send(JSON.stringify(event))
      client.eventCount++
      client.lastSeen = new Date()
      return true
    } catch (error) {
      logger.error('Failed to send event to client', {
        component: 'EnhancedWebSocketManager',
        clientId,
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error)
      })
      this.clients.delete(clientId)
      return false
    }
  }

  /**
   * Broadcast connection count update
   */
  private broadcastConnectionCount(): void {
    this.broadcast({
      type: 'connection_count',
      data: {
        count: this.clients.size,
        timestamp: new Date().toISOString()
      },
      priority: 'low'
    })
  }

  /**
   * Start heartbeat to clean up dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date()
      const deadClients: string[] = []

      this.clients.forEach((client, clientId) => {
        const timeSinceLastSeen = now.getTime() - client.lastSeen.getTime()
        
        // Consider client dead if no activity for 2 minutes
        if (timeSinceLastSeen > 120000) {
          deadClients.push(clientId)
        } else if (client.ws.readyState === WebSocket.OPEN) {
          // Send ping to active clients
          client.ws.ping()
        }
      })

      // Remove dead clients
      deadClients.forEach(clientId => {
        logger.info('Removing dead client', { clientId })
        this.clients.delete(clientId)
      })

      if (deadClients.length > 0) {
        this.broadcastConnectionCount()
      }

    }, 60000) // Every minute
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = {
        totalClients: this.clients.size,
        eventHistory: this.eventHistory.length,
        averageEventsPerClient: this.clients.size > 0 
          ? Array.from(this.clients.values()).reduce((sum, client) => sum + client.eventCount, 0) / this.clients.size 
          : 0,
        timestamp: new Date().toISOString()
      }

      logger.info('WebSocket metrics', {
        component: 'EnhancedWebSocketManager',
        ...metrics
      })

      // Broadcast metrics to interested clients
      this.broadcast({
        type: 'system_status',
        data: {
          status: 'metrics',
          ...metrics
        },
        priority: 'low'
      })

    }, 300000) // Every 5 minutes
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      eventHistory: this.eventHistory.length,
      isInitialized: this.wss !== null,
      serverAddress: this.wss?.address()
    }
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }

    this.clients.forEach((client) => {
      client.ws.close(1001, 'Server shutdown')
    })

    if (this.wss) {
      this.wss.close()
    }

    logger.info('Enhanced WebSocket manager shutdown', {
      component: 'EnhancedWebSocketManager',
      clientsDisconnected: this.clients.size
    })
  }
}

// Singleton instance
export const wsManager = new EnhancedWebSocketManager()

// Convenience functions for common operations
export function broadcastSessionUpdate(sessions: Session[], source?: string) {
  wsManager.broadcast({
    type: 'session_update',
    data: {
      sessions,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'high'
  })
}

export function broadcastSessionCreated(session: Session, source?: string) {
  wsManager.broadcast({
    type: 'session_created',
    data: {
      session,
      sessionKey: session.key,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'high'
  })
}

export function broadcastSessionEnded(sessionKey: string, source?: string) {
  wsManager.broadcast({
    type: 'session_ended',
    data: {
      sessionKey,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'medium'
  })
}

export function broadcastMessageSent(sessionKey: string, messageCount: number, source?: string) {
  wsManager.broadcast({
    type: 'message_sent',
    data: {
      sessionKey,
      messageCount,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'medium'
  })
}

export function broadcastCronTriggered(cronJobId: string, source?: string) {
  wsManager.broadcast({
    type: 'cron_triggered',
    data: {
      cronJobId,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'medium'
  })
}

export function broadcastCronUpdated(cronJobs: CronJob[], source?: string) {
  wsManager.broadcast({
    type: 'cron_updated',
    data: {
      cronJobs,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'medium'
  })
}

export function broadcastAgentStatus(agentId: string, status: string, agents?: Agent[], source?: string) {
  wsManager.broadcast({
    type: 'agent_status',
    data: {
      agentId,
      status,
      agents,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'high'
  })
}

export function broadcastDashboardRefresh(source?: string) {
  wsManager.broadcast({
    type: 'dashboard_refresh',
    data: {
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'low'
  })
}

export function broadcastError(error: string, source?: string) {
  wsManager.broadcast({
    type: 'error',
    data: {
      error,
      timestamp: new Date().toISOString(),
      source
    },
    priority: 'critical'
  })
}