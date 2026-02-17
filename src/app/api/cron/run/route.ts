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
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (GATEWAY_TOKEN) {
      headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
    }

    const response = await fetch(`${GATEWAY_URL}/api/cron/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gateway run job error:', response.status, errorText);
      
      // Mock success for development
      return NextResponse.json({
        success: true,
        message: `Mock job run initiated for ${jobId}`,
        mock: true
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Job '${jobId}' triggered successfully`,
      data
    });
  } catch (error) {
    console.error('Failed to run cron job:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to run job: ${error}`,
    }, { status: 500 });
  }
}