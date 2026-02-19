import { NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5050';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

export async function GET() {
  try {
    // Use internal gateway API to fetch config
    const url = new URL('/api/config', GATEWAY_URL.replace(/^ws/, 'http'));
    
    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Skip TLS verification for Tailscale self-signed certs
      // @ts-expect-error - Node.js fetch extension
      rejectUnauthorized: false,
    });

    if (!res.ok) {
      // Try alternative endpoint
      const altUrl = new URL('/v1/gateway/config', GATEWAY_URL.replace(/^ws/, 'http'));
      const altRes = await fetch(altUrl.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'config.get' }),
      });

      if (!altRes.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch config from gateway', status: altRes.status },
          { status: 500 }
        );
      }

      const altData = await altRes.json();
      return NextResponse.json({ config: altData.result?.config || altData.config || {} });
    }

    const data = await res.json();
    return NextResponse.json({ config: data.config || data.result?.config || data });
  } catch (error) {
    logApiError(error, {
      component: 'GatewayConfigAPI',
      action: 'fetch_config',
      endpoint: '/api/gateway/config',
      gateway_url: GATEWAY_URL
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, patch } = body;

    if (action !== 'config.patch' && action !== 'config.apply') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const url = new URL('/v1/gateway/config', GATEWAY_URL.replace(/^ws/, 'http'));
    
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...(patch && { patch }) }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Gateway returned ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    logApiError(error, {
      component: 'GatewayConfigAPI',
      action: 'update_config',
      endpoint: '/api/gateway/config',
      method: 'POST',
      gateway_url: GATEWAY_URL
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
