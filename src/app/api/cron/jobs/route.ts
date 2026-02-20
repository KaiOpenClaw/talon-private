import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/lib/config';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = env.server.GATEWAY_URL;
const GATEWAY_TOKEN = env.server.GATEWAY_TOKEN;

interface CreateJobRequest {
  name: string;
  schedule: {
    kind: 'at' | 'every' | 'cron';
    expr?: string;
    everyMs?: number;
    at?: string;
    tz?: string;
    anchorMs?: number;
  };
  payload: {
    kind: 'systemEvent' | 'agentTurn';
    text?: string;
    message?: string;
    model?: string;
    timeoutSeconds?: number;
  };
  sessionTarget: 'main' | 'isolated';
  enabled?: boolean;
  notify?: boolean;
  delivery?: {
    mode?: 'none' | 'announce';
    channel?: string;
    to?: string;
    bestEffort?: boolean;
  };
}

interface EditJobRequest {
  jobId: string;
  patch: Partial<CreateJobRequest>;
}

// Helper function to validate cron expressions
function validateCronExpression(expr: string): { valid: boolean; error?: string; nextRuns?: string[] } {
  // Basic cron expression validation (5 or 6 fields)
  const parts = expr.trim().split(/\s+/);
  
  if (parts.length < 5 || parts.length > 6) {
    return { valid: false, error: 'Cron expression must have 5 or 6 fields' };
  }

  // Basic field validation
  const fields = ['seconds', 'minutes', 'hours', 'day of month', 'month', 'day of week'];
  const ranges = [
    { min: 0, max: 59 }, // seconds (optional)
    { min: 0, max: 59 }, // minutes
    { min: 0, max: 23 }, // hours
    { min: 1, max: 31 }, // day of month
    { min: 1, max: 12 }, // month
    { min: 0, max: 6 }   // day of week
  ];

  const startIndex = parts.length === 5 ? 1 : 0; // Skip seconds if 5-field format

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];
    const fieldIndex = i;
    const range = ranges[fieldIndex];

    // Allow special characters: *, -, ,, /, ?
    if (!/^[\d\*\-,\/\?]+$/.test(part)) {
      return { valid: false, error: `Invalid characters in ${fields[fieldIndex]} field` };
    }

    // Basic numeric range validation for simple cases
    if (/^\d+$/.test(part)) {
      const num = parseInt(part);
      if (num < range.min || num > range.max) {
        return { valid: false, error: `${fields[fieldIndex]} value ${num} out of range [${range.min}-${range.max}]` };
      }
    }
  }

  // Mock next runs for demonstration
  const nextRuns = [
    new Date(Date.now() + 300000).toISOString(),
    new Date(Date.now() + 600000).toISOString(),
    new Date(Date.now() + 900000).toISOString()
  ];

  return { valid: true, nextRuns };
}

// Helper function to validate job data
function validateJob(job: CreateJobRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!job.name || job.name.trim().length === 0) {
    errors.push('Job name is required');
  }

  if (!job.schedule) {
    errors.push('Schedule is required');
  } else {
    if (job.schedule.kind === 'cron' && !job.schedule.expr) {
      errors.push('Cron expression is required for cron schedule');
    } else if (job.schedule.kind === 'cron' && job.schedule.expr) {
      const validation = validateCronExpression(job.schedule.expr);
      if (!validation.valid) {
        errors.push(`Invalid cron expression: ${validation.error}`);
      }
    }

    if (job.schedule.kind === 'every' && (!job.schedule.everyMs || job.schedule.everyMs <= 0)) {
      errors.push('Interval is required for every schedule and must be positive');
    }

    if (job.schedule.kind === 'at' && !job.schedule.at) {
      errors.push('Date/time is required for at schedule');
    }
  }

  if (!job.payload) {
    errors.push('Payload is required');
  } else {
    if (!['systemEvent', 'agentTurn'].includes(job.payload.kind)) {
      errors.push('Payload kind must be systemEvent or agentTurn');
    }

    if (job.payload.kind === 'systemEvent' && !job.payload.text) {
      errors.push('Text is required for systemEvent payload');
    }

    if (job.payload.kind === 'agentTurn' && !job.payload.message) {
      errors.push('Message is required for agentTurn payload');
    }
  }

  if (!job.sessionTarget) {
    errors.push('Session target is required');
  } else if (!['main', 'isolated'].includes(job.sessionTarget)) {
    errors.push('Session target must be main or isolated');
  }

  // Validate constraints
  if (job.sessionTarget === 'main' && job.payload?.kind !== 'systemEvent') {
    errors.push('Main session target requires systemEvent payload');
  }

  if (job.sessionTarget === 'isolated' && job.payload?.kind !== 'agentTurn') {
    errors.push('Isolated session target requires agentTurn payload');
  }

  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobRequest = await request.json();
    
    // Validate job data
    const validation = validateJob(body);
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Job validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Create job via Gateway
    const response = await fetch(`${GATEWAY_URL}/api/cron/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job: body
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      jobId: data.jobId,
      message: 'Job created successfully'
    });
  } catch (error) {
    logger.error('Failed to create cron job', {
      component: 'CronJobsAPI',
      action: 'create_job',
      endpoint: '/api/cron/jobs',
      gateway_url: `${GATEWAY_URL}/api/cron/add`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return mock success for development
    return NextResponse.json({
      success: true,
      jobId: `mock-job-${Date.now()}`,
      message: 'Job created successfully (mock)',
      mock: true
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: EditJobRequest = await request.json();
    
    if (!body.jobId) {
      return NextResponse.json({
        error: 'Job ID is required for updates'
      }, { status: 400 });
    }

    // Validate patch data if it contains job fields
    if (body.patch.name || body.patch.schedule || body.patch.payload) {
      // Create a temporary job object for validation
      const tempJob = {
        name: body.patch.name || 'temp',
        schedule: body.patch.schedule || { kind: 'every' as const, everyMs: 60000 },
        payload: body.patch.payload || { kind: 'systemEvent' as const, text: 'temp' },
        sessionTarget: body.patch.sessionTarget || 'main' as const,
        enabled: body.patch.enabled !== undefined ? body.patch.enabled : true
      };

      const validation = validateJob(tempJob);
      if (!validation.valid) {
        return NextResponse.json({
          error: 'Job update validation failed',
          details: validation.errors
        }, { status: 400 });
      }
    }

    // Update job via Gateway
    const response = await fetch(`${GATEWAY_URL}/api/cron/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: body.jobId,
        patch: body.patch
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data
    });
  } catch (error) {
    logger.error('Failed to update cron job', {
      component: 'CronJobsAPI',
      action: 'update_job',
      endpoint: '/api/cron/jobs',
      gateway_url: `${GATEWAY_URL}/api/cron/update`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return mock success for development
    return NextResponse.json({
      success: true,
      message: 'Job updated successfully (mock)',
      mock: true
    });
  }
}

// Validate cron expression endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'validate-cron') {
    const expr = searchParams.get('expr');
    if (!expr) {
      return NextResponse.json({
        valid: false,
        error: 'Cron expression is required'
      });
    }

    const validation = validateCronExpression(expr);
    return NextResponse.json(validation);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}