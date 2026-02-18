/**
 * Sessions API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/logger'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface OpenClawSession {
  key: string
  kind: string
  updatedAt: number
  ageMs: number
  sessionId: string
  totalTokens: number | null
  model: string
  contextTokens: number
  inputTokens?: number
  outputTokens?: number
  groupActivation?: string
  systemSent?: boolean
  abortedLastRun?: boolean
}

interface Session {
  key: string
  kind: string
  agentId?: string
  model?: string
  channel?: string
  createdAt?: string
  lastActivity?: string
  messageCount?: number
  tokenUsage?: {
    input: number
    output: number
    total: number
  }
}

function transformSession(ocSession: OpenClawSession): Session {
  // Extract agentId from key (e.g., "agent:main:discord:..." -> "main")
  const keyParts = ocSession.key.split(':')
  const agentId = keyParts.length >= 2 ? keyParts[1] : undefined
  
  // Extract channel from key if present
  let channel: string | undefined
  if (ocSession.key.includes(':discord:')) {
    channel = 'discord'
  } else if (ocSession.key.includes(':telegram:')) {
    channel = 'telegram'
  } else if (ocSession.key.includes(':cron:')) {
    channel = 'cron'
  }
  
  const createdAt = new Date(ocSession.updatedAt).toISOString()
  const lastActivity = new Date(Date.now() - ocSession.ageMs).toISOString()
  
  return {
    key: ocSession.key,
    kind: ocSession.kind,
    agentId,
    model: ocSession.model,
    channel,
    createdAt,
    lastActivity,
    messageCount: undefined, // Not available in current data
    tokenUsage: {
      input: ocSession.inputTokens || 0,
      output: ocSession.outputTokens || 0,
      total: ocSession.totalTokens || 0
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kinds = searchParams.get('kinds')
    const activeMinutes = searchParams.get('activeMinutes')
    const limit = searchParams.get('limit')
    
    // Build OpenClaw CLI command
    let command = 'openclaw sessions --json'
    if (limit) command += ` --limit ${limit}`
    if (activeMinutes) command += ` --active ${activeMinutes}`
    
    logger.info('Executing OpenClaw CLI command', {
      component: 'SessionsAPI',
      action: 'listSessions',
      command,
      timeout: 10000
    })
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      logger.warn('OpenClaw CLI stderr output', {
        component: 'SessionsAPI',
        action: 'listSessions',
        stderr,
        command
      })
    }
    
    const result = JSON.parse(stdout)
    let sessions: OpenClawSession[] = result.sessions || []
    
    // Apply kinds filter if specified
    if (kinds) {
      const kindsArray = kinds.split(',')
      sessions = sessions.filter(session => kindsArray.includes(session.kind))
    }
    
    // Transform to Talon format
    const transformedSessions = sessions.map(transformSession)
    
    return Response.json({
      sessions: transformedSessions,
      count: transformedSessions.length
    })
    
  } catch (error) {
    logger.error('Sessions API error', {
      component: 'SessionsAPI',
      action: 'listSessions',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Return mock data as fallback
    return Response.json({
      sessions: [
        {
          key: 'fallback-session',
          kind: 'direct',
          agentId: 'talon',
          model: 'claude-opus-4-5',
          channel: 'api',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          tokenUsage: { input: 0, output: 0, total: 0 }
        }
      ],
      count: 1,
      fallback: true
    })
  }
}