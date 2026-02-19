import { NextRequest, NextResponse } from 'next/server';
import { Skill } from '@/types';
import { logApiError } from '@/lib/logger';

// Raw skill format from OpenClaw gateway
interface RawSkill {
  name: string;
  description?: string;
  ready?: boolean;
  disabled?: boolean;
  version?: string;
  dependencies?: string[];
  source?: string;
  missingDeps?: string[];
}

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

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
    const skills = data.skills?.map((skill: RawSkill) => ({
      id: skill.name,
      name: skill.name,
      description: skill.description || 'No description available',
      status: skill.ready ? 'ready' : (skill.disabled ? 'error' : 'unavailable'),
      version: skill.version,
      dependencies: skill.dependencies || []
    })) || [];

    return NextResponse.json({
      skills,
      summary: {
        total: skills.length,
        ready: skills.filter((s: Skill) => s.status === 'ready').length,
        unavailable: skills.filter((s: Skill) => s.status === 'unavailable').length,
        error: skills.filter((s: Skill) => s.status === 'error').length
      }
    });
  } catch (error) {
    logApiError(error, {
      component: 'SkillsAPI',
      action: 'fetch_skills',
      endpoint: '/api/skills',
      gateway_url: `${GATEWAY_URL}/api/skills`
    });
    
    // Return mock data for development/testing
    const mockSkills = [
      {
        id: 'coding-agent',
        name: 'coding-agent',
        description: 'Run Codex CLI, Claude Code, OpenCode via background process',
        status: 'ready' as const,
        dependencies: ['node', 'npm']
      },
      {
        id: 'github',
        name: 'github',
        description: 'gh CLI for issues, PRs, CI runs',
        status: 'ready' as const,
        dependencies: ['gh']
      },
      {
        id: 'gog',
        name: 'gog',
        description: 'Google Workspace (Gmail, Calendar, Drive, Contacts, Sheets, Docs)',
        status: 'ready' as const,
        dependencies: ['google-auth']
      },
      {
        id: 'docker',
        name: 'docker',
        description: 'Container management and deployment',
        status: 'unavailable' as const,
        dependencies: ['docker']
      },
      {
        id: 'kubernetes',
        name: 'kubernetes',
        description: 'Kubernetes cluster management',
        status: 'unavailable' as const,
        dependencies: ['kubectl', 'helm']
      },
      {
        id: 'broken-skill',
        name: 'broken-skill',
        description: 'A skill with configuration errors',
        status: 'error' as const,
        dependencies: []
      }
    ];

    return NextResponse.json({
      skills: mockSkills,
      summary: {
        total: mockSkills.length,
        ready: mockSkills.filter(s => s.status === 'ready').length,
        unavailable: mockSkills.filter(s => s.status === 'unavailable').length,
        error: mockSkills.filter(s => s.status === 'error').length
      },
      mock: true
    });
  }
}