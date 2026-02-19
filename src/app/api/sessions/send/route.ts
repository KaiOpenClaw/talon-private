/**
 * Sessions Send API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger, logApiError } from '@/lib/logger'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Define variables outside try block for proper scope in catch
  let sessionKey: string | undefined
  let agentId: string | undefined
  let message: string | undefined
  let timeoutSeconds: number = 30

  try {
    const requestData = await request.json()
    sessionKey = requestData.sessionKey
    agentId = requestData.agentId
    const label = requestData.label
    message = requestData.message
    timeoutSeconds = requestData.timeoutSeconds || 30
    
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
    
    logger.info('Executing OpenClaw CLI command', {
      component: 'SessionsSendAPI',
      action: 'executeCommand',
      command,
      agentId,
      sessionKey,
      label,
      messageLength: message.length,
      timeout: timeoutSeconds
    })
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: (timeoutSeconds + 10) * 1000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      logger.warn('OpenClaw CLI stderr output', {
        component: 'SessionsSendAPI',
        action: 'commandStderr',
        stderr,
        command,
        agentId,
        sessionKey
      })
    }
    
    return Response.json({
      success: true,
      response: stdout.trim(),
      sessionKey,
      agentId
    })
    
  } catch (error) {
    logApiError(error, {
      component: 'SessionsSendAPI',
      action: 'commandExecution',
      agentId,
      sessionKey,
      messageLength: message?.length || 0,
      timeoutSeconds
    })
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }, { status: 500 })
  }
}