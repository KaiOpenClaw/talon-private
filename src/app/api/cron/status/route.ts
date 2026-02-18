/**
 * Cron Status API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { exec } from 'child_process'
import { promisify } from 'util'

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
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
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
    console.error('Cron Status API error:', error)
    
    // Return mock data as fallback
    return Response.json({
      running: true,
      jobCount: 31,
      fallback: true
    })
  }
}