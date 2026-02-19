/**
 * Session Status API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger, logApiError } from '@/lib/logger'

interface SessionTokenData {
  inputTokens?: number
  outputTokens?: number
}

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionKey = searchParams.get('sessionKey')
    
    // Build command - use status command for session info
    let command = 'openclaw status --json'
    if (sessionKey) {
      // For specific session, we'd need session-specific status
      // For now, return general status
      command = 'openclaw status --json'
    }
    
    logger.debug('Executing OpenClaw CLI command', {
      api: 'session-status',
      command,
      sessionKey
    })
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      logger.warn('OpenClaw CLI produced stderr output', {
        api: 'session-status',
        command,
        stderr,
        sessionKey
      })
    }
    
    const result = JSON.parse(stdout)
    
    // Extract relevant session status info
    const status = {
      model: result.agents?.[0]?.model || 'claude-opus-4-5',
      tokens: {
        input: result.sessions?.reduce((acc: number, s: SessionTokenData) => acc + (s.inputTokens || 0), 0) || 0,
        output: result.sessions?.reduce((acc: number, s: SessionTokenData) => acc + (s.outputTokens || 0), 0) || 0
      },
      cost: undefined, // Not available in current status
      elapsed: result.uptime || '0s'
    }
    
    return Response.json(status)
    
  } catch (error) {
    logApiError(error, {
      api: 'session-status',
      action: 'get-status',
      sessionKey: request.nextUrl.searchParams.get('sessionKey')
    })
    
    // Return mock data as fallback
    return Response.json({
      model: 'claude-opus-4-5',
      tokens: { input: 1000, output: 2000 },
      elapsed: '1h 30m',
      fallback: true
    })
  }
}