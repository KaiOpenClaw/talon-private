'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, Server, Cpu, HardDrive, MemoryStick, 
  Wifi, Clock, RefreshCw, CheckCircle2, XCircle, 
  AlertTriangle, Zap, Calendar, Users, MessageSquare
} from 'lucide-react'

interface GatewayHealth {
  status: string
  version?: string
  uptime?: number
  pid?: number
}

interface MachineStats {
  hostname: string
  cpu: { usage: number; cores: number }
  memory: { used: number; total: number; percent: number }
  disk: { used: number; total: number; percent: number }
  loadAvg: number[]
}

interface ChannelStatus {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  accounts?: number
}

interface CronStatus {
  running: boolean
  jobCount: number
  nextFire?: string
}

interface SessionStats {
  total: number
  active: number
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function StatusCard({ 
  title, 
  icon: Icon, 
  status, 
  children 
}: { 
  title: string
  icon: any
  status: 'ok' | 'warning' | 'error' | 'loading'
  children: React.ReactNode 
}) {
  const statusColors = {
    ok: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    loading: 'border-zinc-500/30 bg-zinc-500/5'
  }
  
  const iconColors = {
    ok: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    loading: 'text-zinc-400'
  }

  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${iconColors[status]}`} />
        <h3 className="font-medium text-zinc-200">{title}</h3>
        <div className="ml-auto">
          {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          {status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
          {status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
          {status === 'loading' && <RefreshCw className="w-4 h-4 text-zinc-400 animate-spin" />}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

function ProgressBar({ percent, color = 'green' }: { percent: number; color?: string }) {
  const colorClass = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }[color] || 'bg-green-500'
  
  return (
    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  )
}

export default function StatusPage() {
  const [gateway, setGateway] = useState<GatewayHealth | null>(null)
  const [machine, setMachine] = useState<MachineStats | null>(null)
  const [channels, setChannels] = useState<ChannelStatus[]>([])
  const [cron, setCron] = useState<CronStatus | null>(null)
  const [sessions, setSessions] = useState<SessionStats | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json()
      
      setGateway(data.gateway)
      setMachine(data.machine)
      setChannels(data.channels || [])
      setCron(data.cron)
      setSessions(data.sessions)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const memoryColor = machine?.memory.percent 
    ? machine.memory.percent > 90 ? 'red' : machine.memory.percent > 70 ? 'yellow' : 'green'
    : 'green'
  
  const diskColor = machine?.disk.percent
    ? machine.disk.percent > 90 ? 'red' : machine.disk.percent > 70 ? 'yellow' : 'green'
    : 'green'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              Talon Status
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Real-time gateway & machine health
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
            <button 
              onClick={fetchStatus}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gateway */}
          <StatusCard 
            title="Gateway" 
            icon={Activity}
            status={gateway?.status === 'ok' ? 'ok' : loading ? 'loading' : 'error'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className={gateway?.status === 'ok' ? 'text-green-400' : 'text-red-400'}>
                {gateway?.status || 'checking...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Version</span>
              <span className="text-zinc-200">{gateway?.version || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Uptime</span>
              <span className="text-zinc-200">
                {gateway?.uptime ? formatUptime(gateway.uptime) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">PID</span>
              <span className="text-zinc-200">{gateway?.pid || '-'}</span>
            </div>
          </StatusCard>

          {/* Machine */}
          <StatusCard 
            title="Machine" 
            icon={Server}
            status={machine ? 'ok' : loading ? 'loading' : 'error'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Hostname</span>
              <span className="text-zinc-200 font-mono text-xs">{machine?.hostname || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Load</span>
              <span className="text-zinc-200">
                {machine?.loadAvg ? machine.loadAvg.map(l => l.toFixed(2)).join(' / ') : '-'}
              </span>
            </div>
          </StatusCard>

          {/* CPU */}
          <StatusCard 
            title="CPU" 
            icon={Cpu}
            status={machine ? 'ok' : loading ? 'loading' : 'error'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Usage</span>
              <span className="text-zinc-200">{machine?.cpu.usage?.toFixed(1) || 0}%</span>
            </div>
            <ProgressBar percent={machine?.cpu.usage || 0} color="green" />
            <div className="flex justify-between">
              <span className="text-zinc-400">Cores</span>
              <span className="text-zinc-200">{machine?.cpu.cores || '-'}</span>
            </div>
          </StatusCard>

          {/* Memory */}
          <StatusCard 
            title="Memory" 
            icon={MemoryStick}
            status={machine ? (machine.memory.percent > 90 ? 'warning' : 'ok') : loading ? 'loading' : 'error'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Used</span>
              <span className="text-zinc-200">
                {machine ? `${formatBytes(machine.memory.used)} / ${formatBytes(machine.memory.total)}` : '-'}
              </span>
            </div>
            <ProgressBar percent={machine?.memory.percent || 0} color={memoryColor} />
            <div className="flex justify-between">
              <span className="text-zinc-400">Percent</span>
              <span className="text-zinc-200">{machine?.memory.percent?.toFixed(1) || 0}%</span>
            </div>
          </StatusCard>

          {/* Disk */}
          <StatusCard 
            title="Disk" 
            icon={HardDrive}
            status={machine ? (machine.disk.percent > 90 ? 'warning' : 'ok') : loading ? 'loading' : 'error'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Used</span>
              <span className="text-zinc-200">
                {machine ? `${formatBytes(machine.disk.used)} / ${formatBytes(machine.disk.total)}` : '-'}
              </span>
            </div>
            <ProgressBar percent={machine?.disk.percent || 0} color={diskColor} />
            <div className="flex justify-between">
              <span className="text-zinc-400">Percent</span>
              <span className="text-zinc-200">{machine?.disk.percent?.toFixed(1) || 0}%</span>
            </div>
          </StatusCard>

          {/* Channels */}
          <StatusCard 
            title="Channels" 
            icon={Wifi}
            status={channels.length > 0 ? 'ok' : loading ? 'loading' : 'warning'}
          >
            {channels.length === 0 && <span className="text-zinc-500">No channels configured</span>}
            {channels.map(ch => (
              <div key={ch.name} className="flex justify-between">
                <span className="text-zinc-400">{ch.name}</span>
                <span className={ch.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                  {ch.status} {ch.accounts ? `(${ch.accounts})` : ''}
                </span>
              </div>
            ))}
          </StatusCard>

          {/* Cron */}
          <StatusCard 
            title="Cron Scheduler" 
            icon={Calendar}
            status={cron?.running ? 'ok' : loading ? 'loading' : 'warning'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className={cron?.running ? 'text-green-400' : 'text-yellow-400'}>
                {cron?.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Jobs</span>
              <span className="text-zinc-200">{cron?.jobCount || 0}</span>
            </div>
            {cron?.nextFire && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Next</span>
                <span className="text-zinc-200 text-xs">{cron.nextFire}</span>
              </div>
            )}
          </StatusCard>

          {/* Sessions */}
          <StatusCard 
            title="Sessions" 
            icon={Users}
            status={sessions ? 'ok' : loading ? 'loading' : 'warning'}
          >
            <div className="flex justify-between">
              <span className="text-zinc-400">Total</span>
              <span className="text-zinc-200">{sessions?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Active (1h)</span>
              <span className="text-green-400">{sessions?.active || 0}</span>
            </div>
          </StatusCard>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          Talon • OpenClaw Dashboard
        </div>
      </div>
    </div>
  )
}
