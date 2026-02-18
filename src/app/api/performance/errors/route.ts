// Performance errors API endpoint
// GET /api/performance/errors - Get recent error metrics

import { NextRequest, NextResponse } from 'next/server';

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

function generateMockErrors(limit: number): PerformanceMetric[] {
  const now = Date.now();
  const last24Hours = 24 * 60 * 60 * 1000;

  const errorOperations = [
    'gateway:sessions',
    'gateway:spawn',
    'api:search',
    'api:send',
    'gateway:status'
  ];

  const errorMessages = [
    'Gateway connection timeout - Unable to reach OpenClaw gateway after 30s',
    'Rate limit exceeded - API quota reached, retry in 60 seconds',
    'Invalid response format - Expected JSON, received HTML error page',
    'Agent not available - Target agent is offline or unreachable',
    'Authentication failed - Invalid gateway token, check configuration',
    'Database connection lost - Unable to connect to LanceDB instance',
    'Memory allocation error - Out of memory during large search operation',
    'Network timeout - Request took longer than 45 seconds to complete',
    'Parsing error - Malformed JSON response from gateway API',
    'Service unavailable - OpenClaw gateway returned 503 status'
  ];

  const agents = ['talon', 'duplex', 'coach', 'vellaco-content'];
  
  const errors: PerformanceMetric[] = [];
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - Math.random() * last24Hours;
    const operation = errorOperations[Math.floor(Math.random() * errorOperations.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const error = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    // Error operations tend to take longer
    const baseDuration = operation.startsWith('gateway:') ? 30000 : 15000;
    const duration = Math.round(baseDuration + Math.random() * 15000);
    
    const errorMetric: PerformanceMetric = {
      timestamp,
      operation,
      duration,
      success: false,
      error,
      agent,
      metadata: {
        errorType: error.includes('timeout') ? 'timeout' :
                   error.includes('rate limit') ? 'rate_limit' :
                   error.includes('auth') ? 'authentication' :
                   error.includes('unavailable') ? 'service_unavailable' :
                   'unknown',
        retryable: !error.includes('auth') && !error.includes('Invalid')
      }
    };
    
    errors.push(errorMetric);
  }
  
  // Sort by timestamp (newest first)
  return errors.sort((a, b) => b.timestamp - a.timestamp);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Replace with actual performance monitoring system
    // For now, return mock data for development
    const errors = generateMockErrors(limit);

    return NextResponse.json(errors);
  } catch (error) {
    console.error('Performance errors API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance errors' },
      { status: 500 }
    );
  }
}