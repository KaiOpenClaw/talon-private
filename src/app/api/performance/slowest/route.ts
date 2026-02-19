// Slowest operations API endpoint
// GET /api/performance/slowest - Get slowest operations

import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  agent?: string;
  metadata?: Record<string, unknown>;
}

function generateSlowestOperations(limit: number): PerformanceMetric[] {
  const now = Date.now();
  const last24Hours = 24 * 60 * 60 * 1000;

  const slowOperations = [
    'api:search',
    'gateway:spawn',
    'api:index',
    'gateway:memory',
    'api:upload',
    'gateway:analyze',
    'api:process',
    'gateway:generate'
  ];

  const agents = ['talon', 'duplex', 'coach', 'vellaco-content'];
  
  const operations: PerformanceMetric[] = [];
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - Math.random() * last24Hours;
    const operation = slowOperations[Math.floor(Math.random() * slowOperations.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const success = Math.random() > 0.2; // 80% success for slow ops
    
    // Generate slow durations (5s to 60s)
    let baseDuration: number;
    switch (operation) {
      case 'api:search':
        baseDuration = 8000; // 8s base for complex searches
        break;
      case 'gateway:spawn':
        baseDuration = 15000; // 15s for agent spawning
        break;
      case 'api:index':
        baseDuration = 25000; // 25s for indexing operations
        break;
      case 'gateway:analyze':
        baseDuration = 12000; // 12s for analysis
        break;
      case 'api:upload':
        baseDuration = 10000; // 10s for file uploads
        break;
      default:
        baseDuration = 7000;
    }
    
    const duration = Math.round(baseDuration + Math.random() * baseDuration * 2); // Up to 3x base duration
    
    const slowMetric: PerformanceMetric = {
      timestamp,
      operation,
      duration,
      success,
      agent,
      metadata: {
        complexity: operation.includes('search') ? 'high' : 
                   operation.includes('spawn') ? 'medium' :
                   operation.includes('index') ? 'very_high' : 'medium',
        dataSize: operation.includes('upload') ? Math.floor(Math.random() * 50) + 'MB' : undefined,
        queryTerms: operation.includes('search') ? Math.floor(Math.random() * 10) + 3 : undefined
      }
    };
    
    // Add error details for failed operations
    if (!success) {
      const slowErrors = [
        'Operation timed out after 45 seconds',
        'Memory limit exceeded during processing',
        'Rate limit hit during bulk operation',
        'Database query timeout - complex join operation',
        'API rate limit exceeded - too many concurrent requests'
      ];
      slowMetric.error = slowErrors[Math.floor(Math.random() * slowErrors.length)];
    }
    
    operations.push(slowMetric);
  }
  
  // Sort by duration (slowest first)
  return operations.sort((a, b) => b.duration - a.duration);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Replace with actual performance monitoring system
    // For now, return mock data for development
    const slowestOps = generateSlowestOperations(limit);

    return NextResponse.json(slowestOps);
  } catch (error) {
    logApiError(error, {
      component: 'SlowestOperationsAPI',
      action: 'fetch_slowest_operations',
      endpoint: '/api/performance/slowest'
    });
    return NextResponse.json(
      { error: 'Failed to fetch slowest operations' },
      { status: 500 }
    );
  }
}