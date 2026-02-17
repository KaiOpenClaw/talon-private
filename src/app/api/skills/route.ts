import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

export async function GET() {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: 'Gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/api/skills`, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the OpenClaw skills response to our format
    const skills = data.skills?.map((skill: any) => ({
      name: skill.name,
      description: skill.description || 'No description available',
      status: skill.ready ? 'ready' : (skill.disabled ? 'disabled' : 'missing-deps'),
      source: skill.source || 'unknown',
      dependencies: skill.dependencies || [],
      missingDeps: skill.missingDeps || []
    })) || [];

    return NextResponse.json({
      skills,
      summary: {
        total: skills.length,
        ready: skills.filter((s: any) => s.status === 'ready').length,
        missingDeps: skills.filter((s: any) => s.status === 'missing-deps').length,
        disabled: skills.filter((s: any) => s.status === 'disabled').length
      }
    });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    
    // Return mock data for development/testing
    const mockSkills = [
      {
        name: 'coding-agent',
        description: 'Run Codex CLI, Claude Code, OpenCode via background process',
        status: 'ready',
        source: 'npm',
        dependencies: ['node', 'npm']
      },
      {
        name: 'github',
        description: 'gh CLI for issues, PRs, CI runs',
        status: 'ready',
        source: 'npm',
        dependencies: ['gh']
      },
      {
        name: 'gog',
        description: 'Google Workspace (Gmail, Calendar, Drive, Contacts, Sheets, Docs)',
        status: 'ready',
        source: 'npm',
        dependencies: ['google-auth']
      },
      {
        name: 'docker',
        description: 'Container management and deployment',
        status: 'missing-deps',
        source: 'npm',
        dependencies: ['docker'],
        missingDeps: ['docker']
      },
      {
        name: 'kubernetes',
        description: 'Kubernetes cluster management',
        status: 'missing-deps',
        source: 'npm',
        dependencies: ['kubectl', 'helm'],
        missingDeps: ['kubectl', 'helm']
      }
    ];

    return NextResponse.json({
      skills: mockSkills,
      summary: {
        total: mockSkills.length,
        ready: mockSkills.filter(s => s.status === 'ready').length,
        missingDeps: mockSkills.filter(s => s.status === 'missing-deps').length,
        disabled: mockSkills.filter(s => s.status === 'disabled').length
      },
      mock: true
    });
  }
}