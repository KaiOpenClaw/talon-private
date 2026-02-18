/**
 * Sessions History API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface SessionMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionKey = searchParams.get('sessionKey')
    const limit = searchParams.get('limit')
    const includeTools = searchParams.get('includeTools') === 'true'
    
    if (!sessionKey) {
      return Response.json({ error: 'sessionKey is required' }, { status: 400 })
    }
    
    // Build OpenClaw CLI command for session history
    let command = `openclaw sessions history ${sessionKey} --json`
    
    if (limit) {
      command += ` --limit ${limit}`
    }
    
    if (includeTools) {
      command += ' --include-tools'
    }
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
    }
    
    const result = JSON.parse(stdout)
    
    // Transform to expected format
    const messages: SessionMessage[] = result.messages || []
    
    return Response.json({
      messages,
      sessionKey,
      count: messages.length
    })
    
  } catch (error) {
    console.error('Sessions History API error:', error)
    
    // Return mock data as fallback
    return Response.json({
      messages: [
        {
          role: 'system',
          content: 'Session history not available (fallback mode)',
          timestamp: new Date().toISOString()
        }
      ],
      sessionKey: 'fallback',
      count: 1,
      fallback: true
    })
  }
}