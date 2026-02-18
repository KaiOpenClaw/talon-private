import { NextResponse } from 'next/server'
import { env } from '@/lib/config'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const GATEWAY_URL = env.server.GATEWAY_URL
const GATEWAY_TOKEN = env.server.GATEWAY_TOKEN
const TALON_API_URL = env.server.TALON_API_URL || 'http://localhost:4100'
const TALON_API_TOKEN = env.server.TALON_API_TOKEN || ''

async function fetchGateway(endpoint: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
    
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, { 
      headers,
      next: { revalidate: 0 },
      // @ts-ignore - Next.js specific
      cache: 'no-store'
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
      next: { revalidate: 0 },
      // @ts-ignore - Next.js specific
      cache: 'no-store'
    })
    if (!res.ok) throw new Error(`Talon API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error(`Talon API fetch error (${endpoint}):`, err)
    return null
  }
}

export async function GET() {
  // Fetch gateway health and machine stats
  // Note: Gateway only exposes /health via HTTP REST
  // Other endpoints (sessions, cron) require WebSocket or CLI
  const [healthData, machineData] = await Promise.all([
    fetchGateway('/health'),
    fetchTalonApi('/machine')
  ])

  // Gateway status from /health endpoint
  const gateway = healthData ? {
    status: healthData.status === 'healthy' ? 'ok' : 'error',
    version: '2026.2.15', // From CLI output
    uptime: Math.floor(healthData.uptime || 0),
    pid: healthData.pid || process.pid,
    activeCalls: healthData.activeCalls || 0
  } : {
    status: 'error'
  }

  // Machine stats (from talon-api)
  const machine = machineData || {
    hostname: 'unknown',
    cpu: { usage: 0, cores: 0 },
    memory: { used: 0, total: 0, percent: 0 },
    disk: { used: 0, total: 0, percent: 0 },
    loadAvg: [0, 0, 0]
  }

  // Channels - known from config (hardcoded for now since REST doesn't expose)
  const channels = [
    { name: 'Discord', status: gateway.status === 'ok' ? 'connected' : 'disconnected', accounts: 5 },
    { name: 'Telegram', status: gateway.status === 'ok' ? 'connected' : 'disconnected', accounts: 1 }
  ]

  // Cron - hardcoded from CLI output (31 jobs)
  // TODO: Expose cron stats via talon-api or gateway WebSocket
  const cron = {
    running: gateway.status === 'ok',
    jobCount: 31,
    nextFire: undefined
  }

  // Sessions - hardcoded estimate
  // TODO: Expose session stats via talon-api  
  const sessions = {
    total: 20,
    active: gateway.activeCalls || 1
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
