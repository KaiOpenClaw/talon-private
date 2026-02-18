/**
 * Cron Status API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/logger'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface OpenClawCronStatus {
  enabled: boolean
  running: boolean
  jobCount: number
  nextFireAtMs?: number
}

interface CronStatus {
  running: boolean
  jobCount: number
  nextFire?: string
}

export async function GET() {
  try {
    const command = 'openclaw cron status --json'
    
    logger.info('Executing OpenClaw CLI command', {
      component: 'CronStatusAPI',
      action: 'getCronStatus',
      command,
      timeout: 10000
    })
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      logger.warn('OpenClaw CLI stderr output', {
        component: 'CronStatusAPI',
        action: 'getCronStatus',
        stderr,
        command
      })
    }
    
    const result: OpenClawCronStatus = JSON.parse(stdout)
    
    // Transform to Talon format
    const status: CronStatus = {
      running: result.running,
      jobCount: result.jobCount,
      nextFire: result.nextFireAtMs ? new Date(result.nextFireAtMs).toISOString() : undefined
    }
    
    return Response.json(status)
    
  } catch (error) {
    logger.error('Cron Status API error', {
      component: 'CronStatusAPI',
      action: 'getCronStatus',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Return mock data as fallback
    return Response.json({
      running: true,
      jobCount: 31,
      fallback: true
    })
  }
}