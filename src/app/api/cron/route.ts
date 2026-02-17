import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6820'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (GATEWAY_TOKEN) {
    headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
  }
  
  return headers;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeDisabled = searchParams.get('includeDisabled') === 'true'
    
    const query = includeDisabled ? '?includeDisabled=true' : ''
    const res = await fetch(`${GATEWAY_URL}/api/cron/list${query}`, {
      headers: getHeaders(),
      cache: 'no-store',
    })
    
    if (!res.ok) {
      console.error('Gateway cron error:', res.status)
      
      // Return mock data for development
      const mockJobs = [
        {
          id: '04fd40da-46a2-4ab2-b0be-e033b0b86520',
          name: '🦅 Talon Development Sprint',
          schedule: 'every 1h',
          nextRun: 'in 6m',
          lastRun: '-',
          status: 'idle',
          target: 'isolated',
          agent: 'duplex'
        },
        {
          id: '1c7e12d8-e8f7-425d-b708-79af27046f9f',
          name: 'Check All-In Podcast Updates',
          schedule: 'every 15m',
          nextRun: 'in 8m',
          lastRun: '7m ago',
          status: 'ok',
          target: 'isolated',
          agent: 'duplex'
        },
        {
          id: 'error-job-123',
          name: 'Process Generation Logs',
          schedule: 'every 5m',
          nextRun: 'in 2m',
          lastRun: '3m ago',
          status: 'error',
          target: 'isolated',
          agent: 'duplex',
          errorMessage: 'Billing issue - quota exceeded'
        },
        {
          id: 'daily-job-456',
          name: 'Morning Kickoff',
          schedule: 'daily at 9:00 AM',
          nextRun: 'tomorrow 9:00 AM',
          lastRun: 'today 9:00 AM',
          status: 'ok',
          target: 'isolated',
          agent: 'personal-assistant'
        },
        {
          id: 'weekly-job-789',
          name: 'Weekly Revenue Review',
          schedule: 'weekly on Monday',
          nextRun: 'next Monday',
          lastRun: 'last Monday',
          status: 'ok',
          target: 'isolated',
          agent: 'accountant'
        }
      ];
      
      return NextResponse.json({ 
        jobs: mockJobs,
        mock: true,
        summary: {
          total: mockJobs.length,
          ok: mockJobs.filter(j => j.status === 'ok').length,
          error: mockJobs.filter(j => j.status === 'error').length,
          idle: mockJobs.filter(j => j.status === 'idle').length,
          running: 0,
          disabled: 0
        }
      })
    }
    
    const data = await res.json()
    
    // Transform OpenClaw format to our dashboard format
    const jobs = data.jobs?.map((job: any) => ({
      id: job.id,
      name: job.name,
      schedule: job.schedule,
      nextRun: job.nextRun || job.next || '-',
      lastRun: job.lastRun || job.last || '-',
      status: job.status || 'idle',
      target: job.target || 'isolated',
      agent: job.agent || 'unknown',
      errorMessage: job.errorMessage
    })) || [];
    
    return NextResponse.json({ 
      jobs,
      summary: {
        total: jobs.length,
        ok: jobs.filter((j: any) => j.status === 'ok').length,
        error: jobs.filter((j: any) => j.status === 'error').length,
        idle: jobs.filter((j: any) => j.status === 'idle').length,
        running: jobs.filter((j: any) => j.status === 'running').length,
        disabled: jobs.filter((j: any) => j.status === 'disabled').length
      }
    })
  } catch (error) {
    console.error('Cron API error:', error)
    return NextResponse.json({ jobs: [], error: 'Failed to fetch cron jobs' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, jobId, enabled } = body
    
    if (action === 'run' && jobId) {
      const res = await fetch(`${GATEWAY_URL}/api/cron/run`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ jobId }),
      })
      
      if (!res.ok) {
        return NextResponse.json({ 
          error: 'Failed to trigger job',
          status: res.status 
        }, { status: res.status })
      }
      
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    }
    
    if (action === 'toggle' && jobId && typeof enabled === 'boolean') {
      const res = await fetch(`${GATEWAY_URL}/api/cron/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          jobId, 
          patch: { enabled } 
        }),
      })
      
      if (!res.ok) {
        return NextResponse.json({ 
          error: 'Failed to toggle job',
          status: res.status 
        }, { status: res.status })
      }
      
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Cron POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}