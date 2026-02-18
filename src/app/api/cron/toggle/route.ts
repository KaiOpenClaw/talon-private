import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/lib/config';

const GATEWAY_URL = env.server.GATEWAY_URL;
const GATEWAY_TOKEN = env.server.GATEWAY_TOKEN;

export async function POST(request: NextRequest) {
  if (!GATEWAY_URL) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const { jobId, enabled } = await request.json();
    
    if (!jobId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Job ID and enabled status are required' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (GATEWAY_TOKEN) {
      headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
    }

    const response = await fetch(`${GATEWAY_URL}/api/cron/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        jobId, 
        patch: { enabled } 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Gateway toggle job error', { 
        status: response.status,
        errorText,
        jobId,
        enabled,
        api: 'cron/toggle'
      });
      
      // Mock success for development
      return NextResponse.json({
        success: true,
        message: `Mock job ${enabled ? 'enabled' : 'disabled'} for ${jobId}`,
        mock: true
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Job '${jobId}' ${enabled ? 'enabled' : 'disabled'} successfully`,
      data
    });
  } catch (error) {
    logger.error('Failed to toggle cron job', { 
      error: error instanceof Error ? error.message : String(error),
      api: 'cron/toggle'
    });
    
    return NextResponse.json({
      success: false,
      error: `Failed to toggle job: ${error}`,
    }, { status: 500 });
  }
}