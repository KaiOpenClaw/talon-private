import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - service is running
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'talon',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}