import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/lib/config';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = env.server.GATEWAY_URL;
const GATEWAY_TOKEN = env.server.GATEWAY_TOKEN;

interface RouteContext {
  params: Promise<{
    jobId: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { jobId } = await params;

  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    const response = await fetch(`${GATEWAY_URL}/api/cron/runs?jobId=${jobId}&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      runs: data.runs || [],
      totalRuns: data.totalRuns || 0,
      jobId
    });
  } catch (error) {
    logger.error('Failed to fetch job runs', {
      component: 'CronJobRunsAPI',
      action: 'fetch_runs',
      endpoint: `/api/cron/jobs/${jobId}/runs`,
      job_id: jobId,
      gateway_url: `${GATEWAY_URL}/api/cron/runs`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return mock data for development
    const mockRuns = [
      {
        id: `run-${Date.now()}-1`,
        jobId,
        startTime: new Date(Date.now() - 300000).toISOString(),
        endTime: new Date(Date.now() - 280000).toISOString(),
        status: 'success',
        exitCode: 0,
        duration: 20000,
        output: 'Job completed successfully',
        error: null
      },
      {
        id: `run-${Date.now()}-2`,
        jobId,
        startTime: new Date(Date.now() - 900000).toISOString(),
        endTime: new Date(Date.now() - 870000).toISOString(),
        status: 'success',
        exitCode: 0,
        duration: 30000,
        output: 'Job completed successfully with additional processing',
        error: null
      },
      {
        id: `run-${Date.now()}-3`,
        jobId,
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date(Date.now() - 1770000).toISOString(),
        status: 'error',
        exitCode: 1,
        duration: 30000,
        output: 'Process started',
        error: 'Network timeout - unable to connect to external service'
      },
      {
        id: `run-${Date.now()}-4`,
        jobId,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3580000).toISOString(),
        status: 'success',
        exitCode: 0,
        duration: 20000,
        output: 'Job completed successfully',
        error: null
      }
    ];

    return NextResponse.json({
      runs: mockRuns,
      totalRuns: mockRuns.length,
      jobId,
      mock: true
    });
  }
}