/**
 * Cron Jobs API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface OpenClawCronJob {
  id: string
  agentId: string
  name?: string
  enabled: boolean
  createdAtMs: number
  updatedAtMs: number
  schedule: {
    kind: 'at' | 'every' | 'cron'
    expr?: string
    at?: string
    everyMs?: number
    anchorMs?: number
  }
  sessionTarget: 'isolated' | 'main'
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
    timeoutSeconds?: number
  }
  lastRunAtMs?: number
  nextRunAtMs?: number
}

interface CronJob {
  id: string
  name?: string
  schedule: {
    kind: 'at' | 'every' | 'cron'
    expr?: string
    at?: string
    everyMs?: number
  }
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
  }
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

function transformCronJob(ocJob: OpenClawCronJob): CronJob {
  return {
    id: ocJob.id,
    name: ocJob.name,
    schedule: {
      kind: ocJob.schedule.kind,
      expr: ocJob.schedule.expr,
      at: ocJob.schedule.at,
      everyMs: ocJob.schedule.everyMs
    },
    payload: {
      kind: ocJob.payload.kind,
      text: ocJob.payload.text,
      message: ocJob.payload.message
    },
    enabled: ocJob.enabled,
    lastRun: ocJob.lastRunAtMs ? new Date(ocJob.lastRunAtMs).toISOString() : undefined,
    nextRun: ocJob.nextRunAtMs ? new Date(ocJob.nextRunAtMs).toISOString() : undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeDisabled = searchParams.get('includeDisabled') === 'true'
    
    // Build OpenClaw CLI command
    let command = 'openclaw cron list --json'
    if (includeDisabled) command += ' --all'
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
    }
    
    const result = JSON.parse(stdout)
    const jobs: OpenClawCronJob[] = result.jobs || []
    
    // Transform to Talon format
    const transformedJobs = jobs.map(transformCronJob)
    
    return Response.json({
      jobs: transformedJobs,
      count: transformedJobs.length
    })
    
  } catch (error) {
    console.error('Cron Jobs API error:', error)
    
    // Return mock data as fallback
    return Response.json({
      jobs: [
        {
          id: 'fallback-job',
          name: 'Fallback Job',
          schedule: { kind: 'every', everyMs: 3600000 },
          payload: { kind: 'systemEvent', text: 'Fallback job' },
          enabled: true,
          lastRun: new Date().toISOString()
        }
      ],
      count: 1,
      fallback: true
    })
  }
}