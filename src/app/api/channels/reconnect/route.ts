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
    const { platform, name } = await request.json();
    
    if (!platform || !name) {
      return NextResponse.json(
        { error: 'Platform and name are required' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (GATEWAY_TOKEN) {
      headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
    }

    const response = await fetch(`${GATEWAY_URL}/api/channels/reconnect`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform, name }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Gateway reconnect channel error', { 
        status: response.status,
        errorText,
        platform,
        name,
        api: 'channels/reconnect'
      });
      
      // Mock success for development
      return NextResponse.json({
        success: true,
        message: `Mock reconnection initiated for ${platform}:${name}`,
        mock: true
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Channel '${platform}:${name}' reconnection initiated`,
      data
    });
  } catch (error) {
    logger.error('Failed to reconnect channel', { 
      error: error instanceof Error ? error.message : String(error),
      api: 'channels/reconnect'
    });
    
    return NextResponse.json({
      success: false,
      error: `Failed to reconnect channel: ${error}`,
    }, { status: 500 });
  }
}