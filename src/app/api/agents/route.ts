import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Talon API server (exposes agent workspaces)
const TALON_API_URL = process.env.TALON_API_URL || 'https://srv1325349.tail657eaf.ts.net:4101'
const TALON_API_TOKEN = process.env.TALON_API_TOKEN || ''

export async function GET() {
  const startTime = Date.now()
  
  try {
    logger.info('Fetching agents from Talon API', {
      component: 'AgentsAPI',
      action: 'fetch_start',
      url: TALON_API_URL,
      tokenPresent: !!TALON_API_TOKEN
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
    
    const response = await fetch(`${TALON_API_URL}/agents`, {
      headers: {
        'Authorization': `Bearer ${TALON_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    const elapsed = Date.now() - startTime
    logger.info('Talon API response received', {
      component: 'AgentsAPI',
      action: 'fetch_response',
      status: response.status,
      elapsed: elapsed
    })

    if (!response.ok) {
      const text = await response.text()
      logger.error('Talon API error response', {
        component: 'AgentsAPI',
        action: 'fetch_error',
        status: response.status,
        response: text,
        url: TALON_API_URL,
        elapsed: Date.now() - startTime
      })
      return NextResponse.json({ 
        agents: [], 
        error: `API returned ${response.status}: ${text}`,
        debug: { url: TALON_API_URL, tokenPresent: !!TALON_API_TOKEN }
      })
    }

    const data = await response.json()
    logger.info('Successfully fetched agents', {
      component: 'AgentsAPI',
      action: 'fetch_success',
      agentCount: data.agents?.length || 0,
      elapsed: Date.now() - startTime
    })
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCause = error instanceof Error && 'cause' in error ? String(error.cause) : undefined
    const elapsed = Date.now() - startTime
    
    logger.error('Talon API fetch failed', {
      component: 'AgentsAPI',
      action: 'fetch_failure',
      error: errorMessage,
      cause: errorCause,
      elapsed: elapsed,
      url: TALON_API_URL,
      tokenPresent: !!TALON_API_TOKEN
    })
    
    return NextResponse.json({ 
      agents: [], 
      error: errorMessage,
      cause: errorCause,
      debug: { 
        url: TALON_API_URL, 
        tokenPresent: !!TALON_API_TOKEN,
        elapsed: Date.now() - startTime
      }
    })
  }
}
