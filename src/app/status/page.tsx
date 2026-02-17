'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Three.js scene to avoid SSR issues
const Scene3D = dynamic(() => import('@/components/status-scene'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

interface StatusData {
  gateway: { status: string; version?: string; uptime?: number; activeCalls?: number }
  machine: {
    hostname: string
    cpu: { usage: number; cores: number }
    memory: { used: number; total: number; percent: number }
    disk: { used: number; total: number; percent: number }
    loadAvg: number[]
  }
  channels: { name: string; status: string; accounts?: number }[]
  cron: { running: boolean; jobCount: number }
  sessions: { total: number; active: number }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)}GB`
}

function StatCard({ label, value, subvalue, color }: { 
  label: string; value: string; subvalue?: string; color: string 
}) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all hover:scale-105">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subvalue && <div className="text-xs text-zinc-400 mt-1">{subvalue}</div>}
    </div>
  )
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to fetch status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const healthy = data?.gateway.status === 'ok'

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Scene3D data={data} />
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 p-6 pointer-events-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              TALON
            </h1>
            <p className="text-zinc-500 text-sm">OpenClaw Command Center</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-600">
              {data?.machine.hostname || '---'}
            </div>
            <div className="text-xs text-zinc-500">
              v{data?.gateway.version || '---'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatCard 
              label="Gateway" 
              value={healthy ? 'ONLINE' : 'OFFLINE'} 
              subvalue={data?.gateway.uptime ? `Up ${formatUptime(data.gateway.uptime)}` : undefined}
              color={healthy ? 'text-green-400' : 'text-red-400'}
            />
            <StatCard 
              label="CPU" 
              value={`${data?.machine.cpu.usage?.toFixed(0) || 0}%`}
              subvalue={`${data?.machine.cpu.cores || 0} cores`}
              color={data?.machine.cpu.usage && data.machine.cpu.usage > 80 ? 'text-red-400' : 'text-amber-400'}
            />
            <StatCard 
              label="Memory" 
              value={`${data?.machine.memory.percent?.toFixed(0) || 0}%`}
              subvalue={data?.machine.memory.total ? `${formatBytes(data.machine.memory.used)} / ${formatBytes(data.machine.memory.total)}` : undefined}
              color={data?.machine.memory.percent && data.machine.memory.percent > 80 ? 'text-red-400' : 'text-emerald-400'}
            />
            <StatCard 
              label="Disk" 
              value={`${data?.machine.disk.percent?.toFixed(0) || 0}%`}
              subvalue={data?.machine.disk.total ? `${formatBytes(data.machine.disk.used)} / ${formatBytes(data.machine.disk.total)}` : undefined}
              color={data?.machine.disk.percent && data.machine.disk.percent > 80 ? 'text-red-400' : 'text-blue-400'}
            />
            <StatCard 
              label="Cron Jobs" 
              value={`${data?.cron.jobCount || 0}`}
              subvalue={data?.cron.running ? 'Running' : 'Stopped'}
              color="text-purple-400"
            />
            <StatCard 
              label="Sessions" 
              value={`${data?.sessions.active || 0}`}
              subvalue={`${data?.sessions.total || 0} total`}
              color="text-cyan-400"
            />
          </div>
          
          {/* Channels row */}
          <div className="mt-3 flex gap-3 flex-wrap">
            {data?.channels.map(ch => (
              <div 
                key={ch.name}
                className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${ch.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-zinc-300">{ch.name}</span>
                {ch.accounts && <span className="text-xs text-zinc-500">({ch.accounts})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
