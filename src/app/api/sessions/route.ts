import { NextRequest, NextResponse } from 'next/server'
import { broadcastSessionUpdate } from '@/lib/websocket-broadcast'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6820'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kinds = searchParams.get('kinds')
    const activeMinutes = searchParams.get('activeMinutes')
    const limit = searchParams.get('limit')
    const messageLimit = searchParams.get('messageLimit')
    
    // Build query for gateway
    const query = new URLSearchParams()
    if (kinds) query.set('kinds', kinds)
    if (activeMinutes) query.set('activeMinutes', activeMinutes)
    if (limit) query.set('limit', limit)
    if (messageLimit) query.set('messageLimit', messageLimit)
    
    const res = await fetch(`${GATEWAY_URL}/api/sessions?${query}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache session data
      cache: 'no-store',
    })
    
    if (!res.ok) {
      console.error('Gateway sessions error:', res.status, await res.text())
      return NextResponse.json({ sessions: [] })
    }
    
    const data = await res.json()
    
    // Broadcast session updates to connected WebSocket clients
    if (data.sessions) {
      broadcastSessionUpdate(data.sessions)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ sessions: [] })
  }
}
