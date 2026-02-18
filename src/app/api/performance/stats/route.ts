// Performance stats API endpoint
// GET /api/performance/stats - Get performance statistics

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorCount: number;
  operationsPerMinute: number;
}

// Mock performance data for development
// In production, this would connect to the actual performance monitoring system
function generateMockStats(timeRange: string, agent: string): PerformanceStats {
  // Simulate different performance based on time range and agent
  const baseOps = timeRange === '5m' ? 25 : timeRange === '10m' ? 50 : timeRange === '1h' ? 300 : 1000;
  const agentMultiplier = agent === 'talon' ? 1.2 : agent === 'duplex' ? 0.8 : 1.0;
  
  const totalOperations = Math.floor(baseOps * agentMultiplier);
  const successRate = 0.92 + (Math.random() * 0.07); // 92-99% success rate
  const errorCount = Math.floor(totalOperations * (1 - successRate));
  
  // Response times vary by agent type
  const baseResponseTime = agent === 'talon' ? 1200 : agent === 'duplex' ? 800 : 1000;
  const variance = Math.random() * 500;
  
  const averageResponseTime = baseResponseTime + variance;
  const p95ResponseTime = averageResponseTime * 1.8;
  const p99ResponseTime = averageResponseTime * 2.5;
  
  const timeRangeMinutes = timeRange === '5m' ? 5 : timeRange === '10m' ? 10 : timeRange === '1h' ? 60 : 1440;
  const operationsPerMinute = totalOperations / timeRangeMinutes;
  
  return {
    totalOperations,
    averageResponseTime: Math.round(averageResponseTime),
    p95ResponseTime: Math.round(p95ResponseTime),
    p99ResponseTime: Math.round(p99ResponseTime),
    successRate,
    errorCount,
    operationsPerMinute
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '10m';
    const agent = searchParams.get('agent') || 'all';

    // TODO: Replace with actual performance monitoring system
    // For now, return mock data for development
    const stats = generateMockStats(timeRange, agent);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Performance stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance stats' },
      { status: 500 }
    );
  }
}