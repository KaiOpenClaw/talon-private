import { NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5050'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''

// On Vercel, we fetch agents from the gateway instead of filesystem
// Locally with AGENTS_DIR set, we could still use filesystem

interface AgentInfo {
  id: string
  name: string
  description: string
  status: 'online' | 'busy' | 'offline'
  avatar: string
  workdir: string
  memorySize?: string
  lastActivity?: string
}

// Default avatars by agent type
const DEFAULT_AVATARS: Record<string, string> = {
  ugc: '🎬',
  scraper: '🕷️',
  vape: '💨',
  adminops: '📋',
  kai: '🦞',
  personal: '🤖',
  shopify: '🛍️',
  duplex: '🎙️',
  default: '🤖'
}

export async function GET() {
  try {
    // Try to get agents list from gateway
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
    
    const res = await fetch(`${GATEWAY_URL}/api/agents`, {
      headers,
      cache: 'no-store',
    })
    
    if (res.ok) {
      const data = await res.json()
      // Map gateway response to our format
      const agents: AgentInfo[] = (data.agents || []).map((agent: any) => ({
        id: agent.id || agent.agentId,
        name: agent.name || agent.id,
        description: agent.description || `${agent.id} agent`,
        status: 'offline',
        avatar: DEFAULT_AVATARS[agent.id] || DEFAULT_AVATARS.default,
        workdir: agent.workspace || agent.workdir || '',
        memorySize: undefined,
        lastActivity: undefined,
      }))
      
      return NextResponse.json({ agents })
    }
    
    // Fallback: try sessions endpoint to infer active agents
    const sessionsRes = await fetch(`${GATEWAY_URL}/api/sessions?activeMinutes=60`, {
      headers,
      cache: 'no-store',
    })
    
    if (sessionsRes.ok) {
      const sessionsData = await sessionsRes.json()
      const agentIds = new Set<string>()
      
      for (const session of sessionsData.sessions || []) {
        if (session.agentId) agentIds.add(session.agentId)
      }
      
      const agents: AgentInfo[] = Array.from(agentIds).map(id => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        description: `${id} agent`,
        status: 'online',
        avatar: DEFAULT_AVATARS[id] || DEFAULT_AVATARS.default,
        workdir: '',
      }))
      
      return NextResponse.json({ agents })
    }
    
    // No agents found
    return NextResponse.json({ agents: [] })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ agents: [], error: 'Failed to fetch agents' })
  }
}
