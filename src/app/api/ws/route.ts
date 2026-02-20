/**
 * Enhanced WebSocket API Route for Real-time Updates
 * Handles WebSocket connections for live dashboard data with improved architecture
 */

import { NextRequest } from 'next/server'
import { wsManager } from '@/lib/websocket-enhanced'
import { logger, logApiError } from '@/lib/logger'

// Initialize WebSocket server on first request
let initialized = false

function ensureWebSocketServer() {
  if (!initialized) {
    try {
      const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : undefined
      const server = wsManager.initialize(port)
      initialized = true
      
      logger.info('Enhanced WebSocket server ready', {
        component: 'WebSocketAPI',
        port: (server.address() as any)?.port || 'dynamic',
        initialized: true
      })
      
      return server
    } catch (error) {
      logger.error('Failed to initialize WebSocket server', {
        component: 'WebSocketAPI',
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    // Ensure WebSocket server is initialized
    ensureWebSocketServer()
    
    const url = request.nextUrl
    const action = url.searchParams.get('action')
    
    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade')
    const connection = request.headers.get('connection')
    
    if (upgrade?.toLowerCase() === 'websocket' && connection?.toLowerCase().includes('upgrade')) {
      // WebSocket upgrade request detected
      // Note: Next.js has limitations with WebSocket upgrades in App Router
      // This endpoint provides connection information for the client
      
      const stats = wsManager.getStats()
      
      return new Response(JSON.stringify({
        status: 'websocket-upgrade-detected',
        message: 'Next.js App Router has WebSocket limitations. Use external WebSocket server.',
        serverStats: stats,
        recommendation: 'Connect directly to WebSocket server port'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      })
    }

    // Handle different API actions
    switch (action) {
      case 'stats':
        return new Response(JSON.stringify({
          status: 'websocket-stats',
          ...wsManager.getStats(),
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      
      case 'test':
        // Broadcast a test event
        wsManager.broadcast({
          type: 'system_status',
          data: {
            status: 'test_event',
            message: 'WebSocket test event triggered',
            timestamp: new Date().toISOString(),
            source: 'API test'
          },
          priority: 'low'
        })
        
        return new Response(JSON.stringify({
          status: 'test-event-sent',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      
      default:
        // Regular status request
        const stats = wsManager.getStats()
        
        return new Response(JSON.stringify({
          status: 'websocket-available',
          endpoint: '/api/ws',
          enhanced: true,
          stats,
          timestamp: new Date().toISOString(),
          note: 'Use WebSocket client with proper server connection for real-time updates'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    logApiError(error, {
      component: 'WebSocketAPI',
      action: 'GET',
      httpMethod: 'GET'
    })
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'WebSocket API error',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureWebSocketServer()
    
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'broadcast':
        // Manual broadcast trigger for testing
        wsManager.broadcast({
          type: data.type || 'system_status',
          data: {
            ...data.payload,
            timestamp: new Date().toISOString(),
            source: 'Manual broadcast'
          },
          priority: data.priority || 'medium'
        })
        
        return new Response(JSON.stringify({
          status: 'broadcast-sent',
          eventType: data.type,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      
      default:
        return new Response(JSON.stringify({
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    logApiError(error, {
      component: 'WebSocketAPI',
      action: 'POST',
      httpMethod: 'POST'
    })
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'WebSocket API error',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}