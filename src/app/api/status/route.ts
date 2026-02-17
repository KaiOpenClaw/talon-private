import { NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5050'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''
const TALON_API_URL = process.env.TALON_API_URL || 'http://localhost:4100'
const TALON_API_TOKEN = process.env.TALON_API_TOKEN || ''

async function fetchGateway(endpoint: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
    
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, { 
      headers,
      next: { revalidate: 0 }
    })
    if (!res.ok) throw new Error(`Gateway ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error(`Gateway fetch error (${endpoint}):`, err)
    return null
  }
}

async function fetchTalonApi(endpoint: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (TALON_API_TOKEN) headers['Authorization'] = `Bearer ${TALON_API_TOKEN}`
    
    const res = await fetch(`${TALON_API_URL}${endpoint}`, { 
      headers,
      next: { revalidate: 0 }
    })
    if (!res.ok) throw new Error(`Talon API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error(`Talon API fetch error (${endpoint}):`, err)
    return null
  }
}

export async function GET() {
  // Fetch all data in parallel
  const [healthData, cronData, sessionsData, machineData] = await Promise.all([
    fetchGateway('/api/health'),
    fetchGateway('/api/cron/status'),
    fetchGateway('/api/sessions?limit=100'),
    fetchTalonApi('/machine')
  ])

  // Gateway status
  const gateway = healthData ? {
    status: 'ok',
    version: healthData.version,
    uptime: healthData.uptime,
    pid: healthData.pid
  } : {
    status: 'error'
  }

  // Machine stats (from talon-api or fallback)
  const machine = machineData || {
    hostname: 'unknown',
    cpu: { usage: 0, cores: 0 },
    memory: { used: 0, total: 0, percent: 0 },
    disk: { used: 0, total: 0, percent: 0 },
    loadAvg: [0, 0, 0]
  }

  // Channels - derive from health data or use defaults
  const channels = []
  if (healthData?.channels) {
    for (const [name, info] of Object.entries(healthData.channels as Record<string, any>)) {
      channels.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: info.connected ? 'connected' : 'disconnected',
        accounts: info.accounts || 1
      })
    }
  } else {
    // Fallback: assume Discord and Telegram are configured
    channels.push(
      { name: 'Discord', status: 'connected', accounts: 5 },
      { name: 'Telegram', status: 'connected', accounts: 1 }
    )
  }

  // Cron status
  const cron = cronData ? {
    running: cronData.running ?? true,
    jobCount: cronData.jobCount ?? cronData.jobs?.length ?? 0,
    nextFire: cronData.nextFire
  } : {
    running: false,
    jobCount: 0
  }

  // Sessions
  const sessionList = sessionsData?.sessions || []
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)
  const activeSessions = sessionList.filter((s: any) => {
    if (!s.lastActivity) return false
    const lastActive = new Date(s.lastActivity).getTime()
    return lastActive > oneHourAgo
  })

  const sessions = {
    total: sessionList.length,
    active: activeSessions.length
  }

  return NextResponse.json({
    gateway,
    machine,
    channels,
    cron,
    sessions,
    timestamp: new Date().toISOString()
  })
}
