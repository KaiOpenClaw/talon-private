import { NextResponse } from 'next/server';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  response_time?: number;
  last_check: string;
}

interface MonitoringResponse {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  checks: HealthCheck[];
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  try {
    // 1. Self Health Check
    checks.push({
      name: 'self',
      status: 'ok',
      message: 'Service responding normally',
      response_time: Date.now() - startTime,
      last_check: new Date().toISOString()
    });

    // 2. Gateway Connection Check
    await checkGatewayHealth(checks);

    // 3. Talon API Check
    await checkTalonApiHealth(checks);

    // 4. OpenAI API Check
    await checkOpenAIHealth(checks);

    // 5. LanceDB Check
    await checkLanceDBHealth(checks);

    // 6. Environment Variables Check
    checkEnvironmentVariables(checks);

    // Determine overall status
    const errorCount = checks.filter(c => c.status === 'error').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    
    let overall_status: 'healthy' | 'degraded' | 'unhealthy';
    if (errorCount > 0) {
      overall_status = 'unhealthy';
    } else if (warningCount > 0) {
      overall_status = 'degraded';
    } else {
      overall_status = 'healthy';
    }

    const response: MonitoringResponse = {
      overall_status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime_seconds: process.uptime(),
      checks
    };

    // Return appropriate HTTP status based on health
    const httpStatus = overall_status === 'unhealthy' ? 503 : 
                      overall_status === 'degraded' ? 200 : 200;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    // Critical error - service is unhealthy
    return NextResponse.json({
      overall_status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime_seconds: process.uptime(),
      checks: [
        {
          name: 'monitor',
          status: 'error',
          message: `Monitoring system failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
          last_check: new Date().toISOString()
        }
      ]
    }, { status: 503 });
  }
}

async function checkGatewayHealth(checks: HealthCheck[]) {
  const gatewayUrl = process.env.GATEWAY_URL;
  
  if (!gatewayUrl) {
    checks.push({
      name: 'gateway',
      status: 'error',
      message: 'GATEWAY_URL not configured',
      last_check: new Date().toISOString()
    });
    return;
  }

  try {
    const startTime = Date.now();
    const response = await fetch(`${gatewayUrl}/api/health`, {
      headers: {
        'Authorization': `Bearer ${process.env.GATEWAY_TOKEN}`,
        'User-Agent': 'Talon-Monitor/1.0'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      checks.push({
        name: 'gateway',
        status: responseTime > 2000 ? 'warning' : 'ok',
        message: `Gateway responding (${response.status})`,
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    } else {
      checks.push({
        name: 'gateway',
        status: 'error',
        message: `Gateway returned ${response.status}`,
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    }
  } catch (error) {
    checks.push({
      name: 'gateway',
      status: 'error',
      message: `Gateway connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      last_check: new Date().toISOString()
    });
  }
}

async function checkTalonApiHealth(checks: HealthCheck[]) {
  const talonApiUrl = process.env.TALON_API_URL;
  
  if (!talonApiUrl) {
    checks.push({
      name: 'talon_api',
      status: 'warning',
      message: 'TALON_API_URL not configured - workspace features unavailable',
      last_check: new Date().toISOString()
    });
    return;
  }

  try {
    const startTime = Date.now();
    const response = await fetch(`${talonApiUrl}/agents`, {
      headers: {
        'Authorization': `Bearer ${process.env.TALON_API_TOKEN}`,
        'User-Agent': 'Talon-Monitor/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const agentCount = Array.isArray(data) ? data.length : 0;
      checks.push({
        name: 'talon_api',
        status: responseTime > 2000 ? 'warning' : 'ok',
        message: `Talon API responding with ${agentCount} agents`,
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    } else {
      checks.push({
        name: 'talon_api',
        status: 'error',
        message: `Talon API returned ${response.status}`,
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    }
  } catch (error) {
    checks.push({
      name: 'talon_api',
      status: 'error',
      message: `Talon API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      last_check: new Date().toISOString()
    });
  }
}

async function checkOpenAIHealth(checks: HealthCheck[]) {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    checks.push({
      name: 'openai',
      status: 'warning',
      message: 'OPENAI_API_KEY not configured - search features unavailable',
      last_check: new Date().toISOString()
    });
    return;
  }

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'User-Agent': 'Talon-Monitor/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      checks.push({
        name: 'openai',
        status: responseTime > 2000 ? 'warning' : 'ok',
        message: 'OpenAI API accessible',
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    } else {
      checks.push({
        name: 'openai',
        status: 'error',
        message: `OpenAI API returned ${response.status}`,
        response_time: responseTime,
        last_check: new Date().toISOString()
      });
    }
  } catch (error) {
    checks.push({
      name: 'openai',
      status: 'error',
      message: `OpenAI API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      last_check: new Date().toISOString()
    });
  }
}

async function checkLanceDBHealth(checks: HealthCheck[]) {
  try {
    // Check if LanceDB directory exists first
    const path = require('path');
    const fs = require('fs');
    const dbPath = process.env.LANCEDB_PATH || path.join(process.cwd(), '.lancedb');
    
    if (!fs.existsSync(dbPath)) {
      checks.push({
        name: 'lancedb',
        status: 'warning',
        message: 'LanceDB directory not found - search index not initialized',
        last_check: new Date().toISOString()
      });
      return;
    }

    // For now, just check if the directory exists and has files
    const files = fs.readdirSync(dbPath);
    const hasFiles = files.length > 0;
    
    checks.push({
      name: 'lancedb',
      status: hasFiles ? 'ok' : 'warning',
      message: hasFiles ? 
        `LanceDB directory exists with ${files.length} files` :
        'LanceDB directory empty - search index may need initialization',
      last_check: new Date().toISOString()
    });
  } catch (error) {
    checks.push({
      name: 'lancedb',
      status: 'warning',
      message: `LanceDB check failed: ${error instanceof Error ? error.message : 'Unknown error'} - search features may be unavailable`,
      last_check: new Date().toISOString()
    });
  }
}

function checkEnvironmentVariables(checks: HealthCheck[]) {
  const requiredVars = [
    'GATEWAY_URL',
    'GATEWAY_TOKEN',
    'TALON_API_URL', 
    'TALON_API_TOKEN',
    'OPENAI_API_KEY',
    'TALON_AUTH_TOKEN'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    checks.push({
      name: 'environment',
      status: 'ok',
      message: 'All required environment variables configured',
      last_check: new Date().toISOString()
    });
  } else {
    checks.push({
      name: 'environment',
      status: 'warning',
      message: `Missing environment variables: ${missingVars.join(', ')}`,
      last_check: new Date().toISOString()
    });
  }
}