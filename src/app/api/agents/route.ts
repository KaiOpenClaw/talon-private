import { NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'https://srv1325349.tail657eaf.ts.net:5050'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''

interface AgentInfo {
  id: string
  name: string
  description: string
  status: 'online' | 'busy' | 'offline'
  avatar: string
  workdir?: string
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
    // Fetch sessions from gateway to infer active agents
    const response = await fetch(`${GATEWAY_URL}/api/sessions`, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      // Return known agents as fallback
      const fallbackAgents: AgentInfo[] = [
        { id: 'duplex', name: 'Duplex', description: 'Real-time voice AI platform', status: 'offline', avatar: '🎙️' },
        { id: 'kai', name: 'Kai', description: 'OpenClaw assistant', status: 'offline', avatar: '🦞' },
        { id: 'personal', name: 'Personal', description: 'Personal assistant', status: 'offline', avatar: '🤖' },
      ]
      return NextResponse.json({ agents: fallbackAgents })
    }

    const data = await response.json()
    const sessions = data.sessions || []

    // Extract unique agents from sessions
    const agentMap = new Map<string, AgentInfo>()
    
    for (const session of sessions) {
      const agentId = session.agent || session.agentId || 'unknown'
      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          id: agentId,
          name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
          description: `${agentId} agent`,
          status: session.status === 'active' ? 'online' : 'offline',
          avatar: DEFAULT_AVATARS[agentId] || DEFAULT_AVATARS.default,
          lastActivity: session.lastActivity,
        })
      }
    }

    // Add known agents if not already present
    const knownAgents = ['duplex', 'kai', 'personal', 'adminops']
    for (const id of knownAgents) {
      if (!agentMap.has(id)) {
        agentMap.set(id, {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          description: `${id} agent`,
          status: 'offline',
          avatar: DEFAULT_AVATARS[id] || DEFAULT_AVATARS.default,
        })
      }
    }

    const agents = Array.from(agentMap.values())
    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error fetching agents:', error)
    // Return fallback on error
    const fallbackAgents: AgentInfo[] = [
      { id: 'duplex', name: 'Duplex', description: 'Real-time voice AI platform', status: 'offline', avatar: '🎙️' },
      { id: 'kai', name: 'Kai', description: 'OpenClaw assistant', status: 'offline', avatar: '🦞' },
    ]
    return NextResponse.json({ agents: fallbackAgents })
  }
}
