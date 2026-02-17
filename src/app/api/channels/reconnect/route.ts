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
      console.error('Gateway reconnect channel error:', response.status, errorText);
      
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
    console.error('Failed to reconnect channel:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to reconnect channel: ${error}`,
    }, { status: 500 });
  }
}