/**
 * Agents API Route - Gateway Bridge  
 * Wraps OpenClaw CLI commands as REST API endpoints
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface OpenClawAgent {
  id: string
  name?: string
  identityName?: string
  identityEmoji?: string
  workspace: string
  agentDir: string
  model: string
  bindings: number
  isDefault: boolean
  routes: string[]
}

interface AgentConfig {
  id: string
  name?: string
  description?: string
  model?: string
  workdir?: string
  soul?: string
  memory?: string
}

function transformAgent(ocAgent: OpenClawAgent): AgentConfig {
  return {
    id: ocAgent.id,
    name: ocAgent.name || ocAgent.identityName,
    description: `${ocAgent.identityEmoji || '🤖'} ${ocAgent.name || ocAgent.id}`,
    model: ocAgent.model,
    workdir: ocAgent.workspace,
    soul: `${ocAgent.workspace}/SOUL.md`,
    memory: `${ocAgent.workspace}/MEMORY.md`
  }
}

export async function GET() {
  try {
    const command = 'openclaw agents list --json'
    
    console.log('Executing:', command)
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      cwd: '/root/clawd/talon-private'
    })
    
    if (stderr && !stderr.includes('npm notice')) {
      console.error('OpenClaw CLI stderr:', stderr)
    }
    
    const agents: OpenClawAgent[] = JSON.parse(stdout)
    
    // Transform to Talon format
    const transformedAgents = agents.map(transformAgent)
    
    return Response.json({
      agents: transformedAgents,
      count: transformedAgents.length
    })
    
  } catch (error) {
    console.error('Agents API error:', error)
    
    // Return mock data as fallback
    return Response.json({
      agents: [
        {
          id: 'talon',
          name: 'Talon Dashboard',
          description: '🎯 OpenClaw Dashboard Agent',
          model: 'claude-opus-4-5',
          workdir: '/root/clawd/agents/talon'
        }
      ],
      count: 1,
      fallback: true
    })
  }
}