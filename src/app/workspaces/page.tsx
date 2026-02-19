'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { 
  FolderOpen, ChevronLeft, Plus, Search, 
  Loader2, Clock, FileText, Zap, Users,
  ChevronRight, Grid, List
} from 'lucide-react'

interface Workspace {
  id: string
  name: string
  description: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
  memorySize?: string
  lastActivity?: string
  blockers?: string[]
  sessionCount?: number
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const [agentsRes, sessionsRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/sessions/list?activeMinutes=60'),
        ])
        
        const agentsData = await agentsRes.json()
        const sessionsData = await sessionsRes.json()
        
        // Merge session data into workspaces
        const workspacesWithSessions = (agentsData.agents || []).map((ws: Workspace) => {
          const wsSessions = sessionsData.sessions?.filter((s: any) => s.agentId === ws.id) || []
          return {
            ...ws,
            status: wsSessions.length > 0 ? 'online' : ws.status,
            sessionCount: wsSessions.length,
          }
        })
        
        setWorkspaces(workspacesWithSessions)
      } catch (e) {
        logger.error('Failed to fetch workspaces', {
          component: 'WorkspacesPage',
          action: 'fetch_workspaces',
          error: e instanceof Error ? e.message : String(e)
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorkspaces()
    const interval = setInterval(fetchWorkspaces, 15000)
    return () => clearInterval(interval)
  }, [])

  const filteredWorkspaces = workspaces
    .filter(ws => filter === 'all' || (filter === 'online' ? ws.status === 'online' : ws.status === 'offline'))
    .filter(ws => !search || ws.name.toLowerCase().includes(search.toLowerCase()) || ws.id.includes(search.toLowerCase()))

  const onlineCount = workspaces.filter(ws => ws.status === 'online').length

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-400" />
                Workspaces
              </h1>
              <p className="text-sm text-ink-tertiary">
                {onlineCount} active • {workspaces.length} total
              </p>
            </div>
            <Link
              href="/workspaces/new"
              className="flex items-center gap-2 px-4 py-2 bg-terminal-600 hover:bg-terminal-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search workspaces..."
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
          
          <div className="flex bg-surface-2 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Grid/List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No workspaces found</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className="bg-surface-1 rounded-xl p-5 border border-border-subtle hover:border-terminal-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                    {ws.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{ws.name}</h3>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        ws.status === 'online' ? 'bg-green-400' : 'bg-ink-muted'
                      }`} />
                    </div>
                    <p className="text-sm text-ink-secondary line-clamp-2">{ws.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink-muted group-hover:text-terminal-400 transition-colors flex-shrink-0" />
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-ink-muted">
                  {ws.memorySize && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {ws.memorySize}
                    </span>
                  )}
                  {ws.sessionCount && ws.sessionCount > 0 && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Zap className="w-3.5 h-3.5" />
                      {ws.sessionCount} active
                    </span>
                  )}
                  {ws.lastActivity && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ws.lastActivity}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWorkspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className="flex items-center gap-4 bg-surface-1 rounded-xl p-4 border border-border-subtle hover:border-terminal-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-lg">
                  {ws.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{ws.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${
                      ws.status === 'online' ? 'bg-green-400' : 'bg-ink-muted'
                    }`} />
                  </div>
                  <p className="text-sm text-ink-tertiary truncate">{ws.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink-muted">
                  {ws.memorySize && <span>{ws.memorySize}</span>}
                  {ws.sessionCount ? <span className="text-green-400">{ws.sessionCount} sessions</span> : null}
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
