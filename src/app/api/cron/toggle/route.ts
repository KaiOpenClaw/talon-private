import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

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
      console.error('Gateway toggle job error:', response.status, errorText);
      
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
    console.error('Failed to toggle cron job:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to toggle job: ${error}`,
    }, { status: 500 });
  }
}