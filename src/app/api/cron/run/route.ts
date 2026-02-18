/**
 * Cron Run API Route - Gateway Bridge
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    
    if (!jobId) {
      return Response.json({ error: 'jobId is required' }, { status: 400 })
    }
    
    const command = `openclaw cron run ${jobId}`
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 30000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
    }
    
    return Response.json({
      success: true,
      output: stdout,
      jobId
    })
    
  } catch (error) {
    console.error('Cron Run API error:', error)
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }, { status: 500 })
  }
}