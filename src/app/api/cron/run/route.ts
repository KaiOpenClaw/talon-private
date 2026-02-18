/**
 * Cron Run API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/logger'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    
    if (!jobId) {
      return Response.json({ error: 'jobId is required' }, { status: 400 })
    }
    
    const command = `openclaw cron run ${jobId}`
    
    logger.info('Executing OpenClaw CLI command', {
      component: 'CronRunAPI',
      action: 'triggerCronJob',
      command,
      jobId,
      timeout: 30000
    })
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 30000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      logger.warn('OpenClaw CLI stderr output', {
        component: 'CronRunAPI',
        action: 'triggerCronJob',
        stderr,
        command,
        jobId
      })
    }
    
    return Response.json({
      success: true,
      output: stdout,
      jobId
    })
    
  } catch (error) {
    logger.error('Cron Run API error', {
      component: 'CronRunAPI',
      action: 'triggerCronJob',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }, { status: 500 })
  }
}