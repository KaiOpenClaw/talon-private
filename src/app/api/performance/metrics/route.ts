// Performance metrics API endpoint
// GET /api/performance/metrics - Get recent performance metrics

import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';
import { performanceMonitor } from '@/lib/performance-monitor';

export const dynamic = 'force-dynamic';

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  agent?: string;
  metadata?: Record<string, any>;
}

function generateMockMetrics(limit: number, timeRange: string, agent: string): PerformanceMetric[] {
  const now = Date.now();
  const timeRangeMs = timeRange === '5m' ? 5 * 60 * 1000 : 
                      timeRange === '10m' ? 10 * 60 * 1000 :
                      timeRange === '1h' ? 60 * 60 * 1000 :
                      timeRange === '6h' ? 6 * 60 * 60 * 1000 :
                      24 * 60 * 60 * 1000; // 1d

  const operations = [
    'gateway:sessions',
    'gateway:agents',
    'api:search',
    'api:spawn',
    'api:send',
    'gateway:cron',
    'user:click',
    'user:navigate',
    'api:memory',
    'gateway:status'
  ];

  const agents = ['talon', 'duplex', 'coach', 'vellaco-content'];
  
  const metrics: PerformanceMetric[] = [];
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - Math.random() * timeRangeMs;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const selectedAgent = agent === 'all' ? agents[Math.floor(Math.random() * agents.length)] : agent;
    const success = Math.random() > 0.08; // 92% success rate
    
    // Duration varies by operation type
    let baseDuration = 1000;
    if (operation.startsWith('gateway:')) baseDuration = 1500;
    if (operation.startsWith('user:')) baseDuration = 200;
    if (operation.includes('search')) baseDuration = 2000;
    if (operation.includes('spawn')) baseDuration = 3000;
    
    const duration = Math.round(baseDuration + (Math.random() - 0.5) * baseDuration * 0.8);
    
    const metric: PerformanceMetric = {
      timestamp,
      operation,
      duration: Math.max(50, duration), // Minimum 50ms
      success,
      agent: selectedAgent,
      metadata: {
        endpoint: operation.includes('api:') ? operation.replace('api:', '/api/') : undefined
      }
    };
    
    if (!success) {
      const errors = [
        'Gateway connection timeout',
        'Rate limit exceeded',
        'Invalid response format',
        'Agent not available',
        'Authentication failed'
      ];
      metric.error = errors[Math.floor(Math.random() * errors.length)];
    }
    
    metrics.push(metric);
  }
  
  // Sort by timestamp (newest first)
  return metrics.sort((a, b) => b.timestamp - a.timestamp);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const timeRange = searchParams.get('timeRange') || '10m';
  const agent = searchParams.get('agent') || 'all';

  try {
    // Get real performance metrics
    const timeRangeMs = timeRange === '5m' ? 5 * 60 * 1000 : 
                        timeRange === '10m' ? 10 * 60 * 1000 :
                        timeRange === '1h' ? 60 * 60 * 1000 :
                        timeRange === '6h' ? 6 * 60 * 60 * 1000 :
                        24 * 60 * 60 * 1000; // 1d

    const stats = performanceMonitor.getStats(timeRangeMs);
    
    // If no real data available (development), fall back to mock data
    if (stats.totalOperations === 0) {
      const metrics = generateMockMetrics(limit, timeRange, agent);
      return NextResponse.json(metrics);
    }

    return NextResponse.json({ 
      stats,
      metrics: performanceMonitor.getMetrics()
        .filter(m => agent === 'all' || m.agent === agent)
        .slice(-limit)
    });
  } catch (error) {
    logApiError(error, {
      component: 'PerformanceMetricsAPI',
      action: 'fetchMetrics',
      limit,
      timeRange,
      agent
    });
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}