import { NextResponse } from 'next/server'

// Talon API server (exposes agent workspaces)
const TALON_API_URL = process.env.TALON_API_URL || 'https://srv1325349.tail657eaf.ts.net:4101'
const TALON_API_TOKEN = process.env.TALON_API_TOKEN || ''

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('[agents] Fetching from:', TALON_API_URL)
    console.log('[agents] Token present:', !!TALON_API_TOKEN)
    
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
    
    console.log('[agents] Response status:', response.status)
    console.log('[agents] Fetch took:', Date.now() - startTime, 'ms')

    if (!response.ok) {
      const text = await response.text()
      console.error('[agents] Error response:', text)
      return NextResponse.json({ 
        agents: [], 
        error: `API returned ${response.status}: ${text}`,
        debug: { url: TALON_API_URL, tokenPresent: !!TALON_API_TOKEN }
      })
    }

    const data = await response.json()
    console.log('[agents] Got', data.agents?.length || 0, 'agents')
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCause = error instanceof Error && 'cause' in error ? String(error.cause) : undefined
    
    console.error('[agents] Fetch error:', errorMessage)
    console.error('[agents] Error cause:', errorCause)
    console.error('[agents] Took:', Date.now() - startTime, 'ms')
    
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
