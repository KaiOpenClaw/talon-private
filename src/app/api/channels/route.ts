import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

export async function GET() {
  if (!GATEWAY_URL) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (GATEWAY_TOKEN) {
      headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`;
    }

    const response = await fetch(`${GATEWAY_URL}/api/channels`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Gateway channels error:', response.status);
      
      // Return mock data for development
      const mockChannels = [
        {
          platform: 'telegram',
          name: 'default',
          status: 'online',
          enabled: true,
          connectedSince: '2 hours ago',
          lastActivity: '5 minutes ago',
          messagesSent: 142,
          messagesReceived: 89,
          accounts: ['Bot Token']
        },
        {
          platform: 'discord',
          name: 'openclaw',
          status: 'online',
          enabled: true,
          connectedSince: '1 day ago',
          lastActivity: '1 minute ago',
          messagesSent: 2341,
          messagesReceived: 1876,
          accounts: ['openclaw#1234']
        },
        {
          platform: 'discord',
          name: 'higgy',
          status: 'online',
          enabled: true,
          connectedSince: '1 day ago',
          lastActivity: '3 minutes ago',
          messagesSent: 1823,
          messagesReceived: 1345,
          accounts: ['higgy#5678']
        },
        {
          platform: 'discord',
          name: 'kai',
          status: 'offline',
          enabled: false,
          lastActivity: '2 hours ago',
          messagesSent: 234,
          messagesReceived: 123,
          accounts: ['kai#9012']
        },
        {
          platform: 'discord',
          name: 'mark-kohler',
          status: 'error',
          enabled: true,
          errorMessage: 'Authentication failed - token expired',
          lastActivity: '1 hour ago',
          messagesSent: 456,
          messagesReceived: 234,
          accounts: ['mark-kohler#3456']
        },
        {
          platform: 'discord',
          name: 'vincent',
          status: 'online',
          enabled: true,
          connectedSince: '6 hours ago',
          lastActivity: '10 minutes ago',
          messagesSent: 678,
          messagesReceived: 456,
          accounts: ['vincent#7890']
        }
      ];
      
      return NextResponse.json({
        channels: mockChannels,
        mock: true,
        summary: {
          total: mockChannels.length,
          online: mockChannels.filter(c => c.status === 'online').length,
          offline: mockChannels.filter(c => c.status === 'offline').length,
          error: mockChannels.filter(c => c.status === 'error').length,
          platforms: [...new Set(mockChannels.map(c => c.platform))]
        }
      });
    }

    const data = await response.json();
    
    // Transform OpenClaw channels response to our format
    const channels = data.channels?.map((channel: any) => ({
      platform: channel.platform || 'unknown',
      name: channel.name || 'default',
      status: channel.status === 'connected' ? 'online' : 
              channel.status === 'error' ? 'error' : 
              channel.enabled === false ? 'offline' : 'offline',
      enabled: channel.enabled !== false,
      connectedSince: channel.connectedSince,
      lastActivity: channel.lastActivity,
      messagesSent: channel.messagesSent || 0,
      messagesReceived: channel.messagesReceived || 0,
      errorMessage: channel.errorMessage,
      accounts: channel.accounts || []
    })) || [];

    return NextResponse.json({
      channels,
      summary: {
        total: channels.length,
        online: channels.filter((c: any) => c.status === 'online').length,
        offline: channels.filter((c: any) => c.status === 'offline').length,
        error: channels.filter((c: any) => c.status === 'error').length,
        platforms: [...new Set(channels.map((c: any) => c.platform))]
      }
    });
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    
    return NextResponse.json({
      channels: [],
      error: 'Failed to fetch channel data'
    }, { status: 500 });
  }
}