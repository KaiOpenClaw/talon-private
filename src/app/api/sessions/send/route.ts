/**
 * Sessions Send API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { sessionKey, agentId, label, message, timeoutSeconds = 30 } = await request.json()
    
    if (!message) {
      return Response.json({ error: 'message is required' }, { status: 400 })
    }
    
    // Build OpenClaw CLI command for sending messages
    let command = 'openclaw agent'
    
    if (agentId) {
      command += ` --agent ${agentId}`
    }
    
    if (sessionKey) {
      command += ` --session ${sessionKey}`
    }
    
    if (label) {
      command += ` --label "${label}"`
    }
    
    // Add the message - escape quotes
    const escapedMessage = message.replace(/"/g, '\\"')
    command += ` -m "${escapedMessage}"`
    
    // Add timeout
    command += ` --timeout ${timeoutSeconds}`
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: (timeoutSeconds + 10) * 1000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
    }
    
    return Response.json({
      success: true,
      response: stdout.trim(),
      sessionKey,
      agentId
    })
    
  } catch (error) {
    console.error('Sessions Send API error:', error)
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }, { status: 500 })
  }
}