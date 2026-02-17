/**
 * WebSocket Broadcast System
 * Handles broadcasting updates to connected WebSocket clients
 */

import { WebSocket, WebSocketServer } from 'ws'

interface WebSocketMessage {
  type: 'sessions' | 'agents' | 'cron' | 'chat' | 'status' | 'error'
  data?: any
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
    console.log('No WebSocket connections to broadcast to')
    return
  }

  const payload = JSON.stringify(message)
  
  globalConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload)
      } catch (error) {
        console.error('Error broadcasting to client:', error)
        globalConnections.delete(ws)
      }
    } else {
      globalConnections.delete(ws)
    }
  })

  console.log(`Broadcasted ${message.type} update to ${globalConnections.size} clients`)
}

// Convenience functions for specific data types
export function broadcastSessionUpdate(sessions: any[]) {
  broadcastToClients({
    type: 'sessions',
    data: { sessions },
    timestamp: Date.now()
  })
}

export function broadcastAgentUpdate(agents: any[]) {
  broadcastToClients({
    type: 'agents', 
    data: { agents },
    timestamp: Date.now()
  })
}

export function broadcastCronUpdate(jobs: any[]) {
  broadcastToClients({
    type: 'cron',
    data: { jobs },
    timestamp: Date.now()
  })
}

export function broadcastChatMessage(message: any) {
  broadcastToClients({
    type: 'chat',
    data: { message },
    timestamp: Date.now()
  })
}

export function broadcastStatus(status: any) {
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