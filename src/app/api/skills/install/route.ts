import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';

const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

export async function POST(request: NextRequest) {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const { skill } = await request.json();
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${GATEWAY_URL}/api/skills/install`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skill }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gateway API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Skill '${skill}' installation initiated`,
      data
    });
  } catch (error) {
    logApiError(error, {
      component: 'SkillsInstallAPI',
      action: 'install_skill',
      endpoint: '/api/skills/install',
      method: 'POST'
    });
    
    // Mock installation for development
    return NextResponse.json({
      success: true,
      message: `Mock installation of skill initiated`,
      mock: true
    });
  }
}

export async function DELETE(request: NextRequest) {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const { skill } = await request.json();
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${GATEWAY_URL}/api/skills/uninstall`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skill }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gateway API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Skill '${skill}' removed`,
      data
    });
  } catch (error) {
    logApiError(error, {
      component: 'SkillsInstallAPI',
      action: 'uninstall_skill',
      endpoint: '/api/skills/install',
      method: 'DELETE'
    });
    
    return NextResponse.json({
      success: false,
      message: `Failed to uninstall skill: ${error}`,
      mock: true
    }, { status: 500 });
  }
}