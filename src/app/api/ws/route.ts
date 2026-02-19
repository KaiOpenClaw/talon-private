/**
 * WebSocket API Route for Real-time Updates
 * Handles WebSocket connections for live dashboard data
 */

import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { setWebSocketServer } from '@/lib/websocket-broadcast'
import { logger, logApiError } from '@/lib/logger'

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const connections = new Set<WebSocket>()

interface WebSocketMessage {
  type: 'sessions' | 'agents' | 'cron' | 'chat' | 'status'
  data?: unknown
  timestamp: number
}

function initWebSocketServer() {
  if (wss) return wss

  wss = new WebSocketServer({ 
    port: 0, // Let system choose port
    perMessageDeflate: false 
  })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    logger.info('WebSocket client connected', {
      component: 'WebSocketAPI',
      action: 'clientConnected',
      remoteAddress: req.socket.remoteAddress,
      totalConnections: connections.size + 1,
      timestamp: Date.now()
    })
    connections.add(ws)
    
    // Register connections with broadcast system
    if (wss) {
      setWebSocketServer(wss, connections)
    }

    // Send initial connection acknowledgment
    ws.send(JSON.stringify({
      type: 'status',
      data: { connected: true, timestamp: Date.now() },
      timestamp: Date.now()
    }))

    // Handle ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      }
    }, 30000)

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        logger.debug('WebSocket message received', {
          component: 'WebSocketAPI',
          action: 'messageReceived',
          messageType: message.type,
          dataSize: data.length,
          timestamp: Date.now()
        })
        
        // Handle client requests (subscriptions, etc.)
        if (message.type === 'subscribe') {
          // Client wants to subscribe to specific data streams
          // Implementation for subscription management
        }
      } catch (error) {
        logApiError(error, {
          component: 'WebSocketAPI',
          action: 'messageParseError',
          dataSize: data.length,
          rawData: data.toString().substring(0, 100), // First 100 chars for debugging
          timestamp: Date.now()
        })
      }
    })

    ws.on('close', () => {
      logger.info('WebSocket client disconnected', {
        component: 'WebSocketAPI',
        action: 'clientDisconnected',
        totalConnections: connections.size - 1,
        timestamp: Date.now()
      })
      connections.delete(ws)
      clearInterval(pingInterval)
    })

    ws.on('error', (error) => {
      logApiError(error, {
        component: 'WebSocketAPI',
        action: 'websocketError',
        totalConnections: connections.size,
        timestamp: Date.now()
      })
      connections.delete(ws)
    })
  })

  return wss
}

// Broadcast functionality moved to /lib/websocket-broadcast.ts

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade')
  const connection = request.headers.get('connection')
  
  if (upgrade?.toLowerCase() === 'websocket' && connection?.toLowerCase().includes('upgrade')) {
    // This is a WebSocket upgrade request
    // In Next.js 13+, WebSocket upgrades need to be handled differently
    // For now, return connection info
    
    const server = initWebSocketServer()
    
    return new Response(JSON.stringify({
      status: 'websocket-ready',
      port: (server.address() as { port?: number } | null)?.port || 'dynamic',
      connections: connections.size
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  // Regular HTTP request - return WebSocket info
  return new Response(JSON.stringify({
    status: 'websocket-available',
    endpoint: '/api/ws',
    activeConnections: connections.size,
    timestamp: Date.now()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

// broadcastUpdate is already exported above with the function definition