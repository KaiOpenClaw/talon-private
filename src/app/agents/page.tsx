'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Users, ChevronLeft, ChevronRight, Search,
  Loader2, AlertTriangle, Clock, FileText
} from 'lucide-react'
import { logger } from '@/lib/logger'
import PullToRefresh from '@/components/mobile/pull-to-refresh'

interface Agent {
  id: string
  name: string
  description: string
  status: 'online' | 'busy' | 'offline'
  avatar: string
  workdir: string
  memorySize?: string
  lastActivity?: string
  blockers?: string[]
}

function StatusBadge({ status }: { status: 'online' | 'busy' | 'offline' }) {
  const config = {
    online: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400', label: 'Online' },
    busy: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Busy' },
    offline: { bg: 'bg-surface-3', text: 'text-ink-muted', dot: 'bg-ink-muted', label: 'Offline' },
  }
  const c = config[status]
  
  return (
    <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'online' ? 'pulse-online' : ''}`} />
      {c.label}
    </span>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data.agents || [])
      
      logger.debug('Agents refreshed', { 
        component: 'AgentsPage',
        action: 'fetchAgents',
        count: data.agents?.length || 0
      })
    } catch (e) {
      logger.error('Failed to load agents', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'AgentsPage',
        action: 'fetchAgents'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    
    // Auto-refresh every 10s
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [fetchAgents])

  const filteredAgents = agents
    .filter(a => filter === 'all' || (filter === 'online' ? a.status === 'online' : a.status === 'offline'))
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))

  const onlineCount = agents.filter(a => a.status === 'online').length

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-terminal-500" />
                Agents
              </h1>
              <p className="text-sm text-ink-tertiary">
                {onlineCount} online • {agents.length} total
              </p>
            </div>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={fetchAgents} disabled={loading}>
        {/* Filters */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border-default rounded-lg text-sm focus:outline-none focus:border-terminal-500/50"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'online', 'offline'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-terminal-500/20 text-terminal-400 border border-terminal-500/30' 
                      : 'bg-surface-2 text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-ink-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/?agent=${agent.id}`}
                  className="bg-surface-1 rounded-xl p-5 border border-border-subtle hover:border-terminal-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                      {agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <StatusBadge status={agent.status} />
                      </div>
                      <p className="text-sm text-ink-secondary line-clamp-2">{agent.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-muted group-hover:text-terminal-400 transition-colors flex-shrink-0" />
                  </div>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-ink-muted">
                    {agent.memorySize && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {agent.memorySize}
                      </span>
                    )}
                    {agent.lastActivity && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {agent.lastActivity}
                      </span>
                    )}
                    {agent.blockers && agent.blockers.length > 0 && (
                      <span className="flex items-center gap-1 text-status-busy">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {agent.blockers.length} blocker{agent.blockers.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}
