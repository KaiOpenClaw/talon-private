import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { env } from '@/lib/config'

const GATEWAY_URL = env.server.GATEWAY_URL

/**
 * Spawn a sub-agent session
 * This uses OpenClaw's sessions_spawn feature for cross-agent work
 */
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for spawning
  const rateLimited = checkRateLimit(request, RATE_LIMITS.SPAWN)
  if (rateLimited) return rateLimited
  
  try {
    const body = await request.json()
    const { 
      task, 
      agentId, 
      label,
      model,
      thinking,
      runTimeoutSeconds = 300,
      cleanup = 'keep'
    } = body
    
    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }
    
    // Call gateway sessions_spawn endpoint
    const res = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
        agentId,
        label,
        model,
        thinking,
        runTimeoutSeconds,
        cleanup,
      }),
    })
    
    if (!res.ok) {
      const error = await res.text()
      logger.error('Gateway spawn request failed', {
        component: 'SpawnAPI',
        action: 'spawn_session',
        status: res.status,
        error: error,
        task: task,
        agentId: agentId
      })
      return NextResponse.json({ error: `Spawn failed: ${res.status}` }, { status: res.status })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Spawn API request failed', {
      component: 'SpawnAPI',
      action: 'spawn_session_error',
      error: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json({ error: 'Failed to spawn agent' }, { status: 500 })
  }
}

/**
 * List available agents for spawning
 */
export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/agents/list`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    
    if (!res.ok) {
      return NextResponse.json({ agents: [] })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to fetch agents list', {
      component: 'SpawnAPI',
      action: 'list_agents',
      error: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json({ agents: [] })
  }
}
