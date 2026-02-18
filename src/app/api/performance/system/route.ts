// System metrics API endpoint
// GET /api/performance/system - Get system health metrics

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SystemMetrics {
  timestamp: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

function generateMockSystemMetrics(): SystemMetrics {
  const now = Date.now();
  
  // Simulate realistic system metrics
  const activeConnections = Math.floor(Math.random() * 10) + 2; // 2-12 connections
  const requestsPerMinute = Math.random() * 50 + 10; // 10-60 requests/min
  const errorRate = Math.random() * 0.08; // 0-8% error rate
  
  return {
    timestamp: now,
    activeConnections,
    requestsPerMinute,
    errorRate
  };
}

export async function GET() {
  try {
    // TODO: Replace with actual system monitoring
    // For now, return mock data for development
    const systemMetrics = generateMockSystemMetrics();

    return NextResponse.json(systemMetrics);
  } catch (error) {
    console.error('System metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}