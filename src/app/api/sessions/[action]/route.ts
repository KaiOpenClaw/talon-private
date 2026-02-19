import { NextRequest, NextResponse } from 'next/server'
import { logApiError } from '@/lib/logger'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6820'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''

function getHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
  return headers
}

type Params = { params: Promise<{ action: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { action } = await params
  const searchParams = request.nextUrl.searchParams
  
  try {
    switch (action) {
      case 'list': {
        const kinds = searchParams.get('kinds')
        const activeMinutes = searchParams.get('activeMinutes') || '60'
        const limit = searchParams.get('limit') || '50'
        const messageLimit = searchParams.get('messageLimit') || '3'
        
        const query = new URLSearchParams({
          activeMinutes,
          limit,
          messageLimit,
        })
        if (kinds) query.set('kinds', kinds)
        
        const res = await fetch(`${GATEWAY_URL}/api/sessions?${query}`, {
          cache: 'no-store',
          headers: getHeaders(),
        })
        
        if (!res.ok) return NextResponse.json({ sessions: [] })
        return NextResponse.json(await res.json())
      }
      
      case 'history': {
        const sessionKey = searchParams.get('sessionKey')
        if (!sessionKey) {
          return NextResponse.json({ error: 'sessionKey required' }, { status: 400 })
        }
        
        const limit = searchParams.get('limit') || '50'
        const includeTools = searchParams.get('includeTools') === 'true'
        
        const query = new URLSearchParams({ sessionKey, limit })
        if (includeTools) query.set('includeTools', 'true')
        
        const res = await fetch(`${GATEWAY_URL}/api/sessions/history?${query}`, {
          cache: 'no-store',
          headers: getHeaders(),
        })
        
        if (!res.ok) return NextResponse.json({ messages: [] })
        return NextResponse.json(await res.json())
      }
      
      case 'status': {
        const sessionKey = searchParams.get('sessionKey')
        const query = sessionKey ? `?sessionKey=${sessionKey}` : ''
        
        const res = await fetch(`${GATEWAY_URL}/api/session/status${query}`, {
          cache: 'no-store',
          headers: getHeaders(),
        })
        
        if (!res.ok) return NextResponse.json({})
        return NextResponse.json(await res.json())
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    logApiError(error, {
      component: 'SessionsActionAPI',
      action: `sessions${action}GET`,
      httpMethod: 'GET',
      sessionAction: action
    })
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { action } = await params
  
  try {
    const body = await request.json()
    
    switch (action) {
      case 'send': {
        const { sessionKey, agentId, label, message, timeoutSeconds = 120 } = body
        
        if (!message) {
          return NextResponse.json({ error: 'message required' }, { status: 400 })
        }
        
        const res = await fetch(`${GATEWAY_URL}/api/sessions/send`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ sessionKey, agentId, label, message, timeoutSeconds }),
        })
        
        if (!res.ok) {
          return NextResponse.json({ error: 'Send failed' }, { status: res.status })
        }
        
        return NextResponse.json(await res.json())
      }
      
      case 'spawn': {
        const { task, agentId, label, model, thinking, runTimeoutSeconds = 300, cleanup = 'keep' } = body
        
        if (!task) {
          return NextResponse.json({ error: 'task required' }, { status: 400 })
        }
        
        const res = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ task, agentId, label, model, thinking, runTimeoutSeconds, cleanup }),
        })
        
        if (!res.ok) {
          return NextResponse.json({ error: 'Spawn failed' }, { status: res.status })
        }
        
        return NextResponse.json(await res.json())
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    logApiError(error, {
      component: 'SessionsActionAPI',
      action: `sessions${action}POST`,
      httpMethod: 'POST',
      sessionAction: action
    })
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
