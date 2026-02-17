/**
 * WebSocket API Route for Real-time Updates
 * Handles WebSocket connections for live dashboard data
 */

import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { setWebSocketServer } from '@/lib/websocket-broadcast'

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const connections = new Set<WebSocket>()

interface WebSocketMessage {
  type: 'sessions' | 'agents' | 'cron' | 'chat' | 'status'
  data?: any
  timestamp: number
}

function initWebSocketServer() {
  if (wss) return wss

  wss = new WebSocketServer({ 
    port: 0, // Let system choose port
    perMessageDeflate: false 
  })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('WebSocket client connected:', req.socket.remoteAddress)
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
        console.log('WebSocket message received:', message)
        
        // Handle client requests (subscriptions, etc.)
        if (message.type === 'subscribe') {
          // Client wants to subscribe to specific data streams
          // Implementation for subscription management
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    })

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
      connections.delete(ws)
      clearInterval(pingInterval)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
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
      port: (server.address() as any)?.port || 'dynamic',
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