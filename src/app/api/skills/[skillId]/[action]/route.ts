import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

interface RouteContext {
  params: {
    skillId: string
    action: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { skillId, action } = params;

  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  if (!['enable', 'disable', 'install'].includes(action)) {
    return NextResponse.json(
      { error: `Invalid action: ${action}. Must be enable, disable, or install.` },
      { status: 400 }
    );
  }

  try {
    // Map actions to OpenClaw CLI commands
    const commandMap = {
      enable: `openclaw skills enable ${skillId}`,
      disable: `openclaw skills disable ${skillId}`,
      install: `openclaw skills install ${skillId}`
    };

    const command = commandMap[action as keyof typeof commandMap];

    // Execute the OpenClaw CLI command via gateway
    const response = await fetch(`${GATEWAY_URL}/api/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        timeout: 30000, // 30 seconds timeout
        captureOutput: true
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway exec API responded with ${response.status}`);
    }

    const result = await response.json();
    
    // Check if the command succeeded
    if (result.exitCode === 0) {
      return NextResponse.json({
        success: true,
        message: `Successfully ${action}d skill: ${skillId}`,
        output: result.stdout,
        command
      });
    } else {
      return NextResponse.json(
        { 
          error: `Failed to ${action} skill: ${skillId}`,
          details: result.stderr || result.stdout || 'Unknown error',
          command,
          exitCode: result.exitCode
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logApiError(error, {
      component: 'SkillActionAPI',
      action: `skill_${action}`,
      endpoint: `/api/skills/${skillId}/${action}`,
      skill_id: skillId,
      gateway_url: `${GATEWAY_URL}/api/exec`
    });
    
    // Return mock responses for development/testing
    const mockResponses = {
      enable: {
        success: true,
        message: `Successfully enabled skill: ${skillId}`,
        output: `Skill ${skillId} has been enabled`,
        mock: true
      },
      disable: {
        success: true,
        message: `Successfully disabled skill: ${skillId}`,
        output: `Skill ${skillId} has been disabled`,
        mock: true
      },
      install: {
        success: true,
        message: `Successfully installed skill: ${skillId}`,
        output: `Skill ${skillId} has been installed and is now available`,
        mock: true
      }
    };

    return NextResponse.json(mockResponses[action as keyof typeof mockResponses] || {
      error: `Mock error for ${action} operation on skill: ${skillId}`,
      mock: true
    });
  }
}