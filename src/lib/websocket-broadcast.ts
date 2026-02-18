/**
 * WebSocket Broadcast System
 * Handles broadcasting updates to connected WebSocket clients
 */

import { WebSocket, WebSocketServer } from 'ws'
import { Agent, Session, CronJob, Message } from '@/types'
import { logger } from '@/lib/logger'

interface WebSocketMessage {
  type: 'sessions' | 'agents' | 'cron' | 'chat' | 'status' | 'error'
  data?: unknown
  timestamp: number
}

// Global state for WebSocket connections
let globalWss: WebSocketServer | null = null
let globalConnections = new Set<WebSocket>()

export function setWebSocketServer(wss: WebSocketServer, connections: Set<WebSocket>) {
  globalWss = wss
  globalConnections = connections
}

export function broadcastToClients(message: WebSocketMessage) {
  if (!globalWss || globalConnections.size === 0) {
    logger.debug('No WebSocket connections to broadcast to', {
      component: 'websocket-broadcast',
      action: 'broadcastToClients',
      connectionCount: globalConnections.size
    })
    return
  }

  const payload = JSON.stringify(message)
  
  globalConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload)
      } catch (error) {
        logger.error('Error broadcasting to client', {
          component: 'websocket-broadcast',
          action: 'sendMessage',
          error: error instanceof Error ? error.message : String(error),
          messageType: message.type
        })
        globalConnections.delete(ws)
      }
    } else {
      globalConnections.delete(ws)
    }
  })

  logger.info('Broadcast message sent', {
    component: 'websocket-broadcast',
    action: 'broadcastToClients',
    messageType: message.type,
    clientCount: globalConnections.size
  })
}

// Convenience functions for specific data types
export function broadcastSessionUpdate(sessions: Session[]) {
  broadcastToClients({
    type: 'sessions',
    data: { sessions },
    timestamp: Date.now()
  })
}

export function broadcastAgentUpdate(agents: Agent[]) {
  broadcastToClients({
    type: 'agents', 
    data: { agents },
    timestamp: Date.now()
  })
}

export function broadcastCronUpdate(jobs: CronJob[]) {
  broadcastToClients({
    type: 'cron',
    data: { jobs },
    timestamp: Date.now()
  })
}

export function broadcastChatMessage(message: Message) {
  broadcastToClients({
    type: 'chat',
    data: { message },
    timestamp: Date.now()
  })
}

export function broadcastStatus(status: Record<string, unknown>) {
  broadcastToClients({
    type: 'status',
    data: status,
    timestamp: Date.now()
  })
}

export function broadcastError(error: string) {
  broadcastToClients({
    type: 'error',
    data: { error },
    timestamp: Date.now()
  })
}