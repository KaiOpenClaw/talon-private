import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6820'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''

export async function POST(request: NextRequest) {
  // Apply rate limiting for message sending
  const rateLimited = checkRateLimit(request, RATE_LIMITS.SEND_MESSAGE)
  if (rateLimited) return rateLimited
  
  try {
    const body = await request.json()
    const { agentId, message, sessionKey, timeoutSeconds = 120 } = body
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    if (!agentId && !sessionKey) {
      return NextResponse.json({ error: 'Either agentId or sessionKey is required' }, { status: 400 })
    }
    
    // Send to gateway
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
    
    const res = await fetch(`${GATEWAY_URL}/api/sessions/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        agentId,
        sessionKey,
        message,
        timeoutSeconds,
      }),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      logger.error('Gateway send error', { 
        status: res.status,
        errorText,
        url: res.url,
        api: 'send'
      })
      return NextResponse.json({ error: `Gateway error: ${res.status}` }, { status: res.status })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Send API error', { 
      error: error instanceof Error ? error.message : String(error),
      api: 'send'
    })
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
