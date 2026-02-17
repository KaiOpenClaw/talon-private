'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Terminal, MessageSquare, Zap, Settings, FileText, 
  Activity, Clock, AlertTriangle, ChevronRight, 
  Loader2, RefreshCw, Users, Calendar, Search,
  FolderOpen, Plus
} from 'lucide-react'
import ChatPanel from '@/components/chat-panel'

interface Agent {
  id: string
  name: string
  avatar: string
  description: string
  status: 'online' | 'busy' | 'offline'
  memorySize?: string
  lastActivity?: string
  workdir: string
}

interface Session {
  key: string
  agentId?: string
  kind: string
  lastActivity?: string
  messageCount?: number
}

interface Blocker {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  category?: string
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'chat' | 'agents' | 'sessions'>('chat')

  // Load data once on mount
  useEffect(() => {
    let mounted = true
    
    async function load() {
      try {
        const [agentsRes, sessionsRes, blockersRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/sessions/list?activeMinutes=120&limit=20'),
          fetch('/api/blockers'),
        ])
        
        if (!mounted) return
        
        const agentsData = await agentsRes.json()
        const sessionsData = await sessionsRes.json()
        const blockersData = await blockersRes.json()
        
        const agentsList = agentsData.agents || []
        setAgents(agentsList)
        setSessions(sessionsData.sessions || [])
        setBlockers(blockersData.blockers || [])
        
        // Auto-select first agent if none selected
        if (agentsList.length > 0 && !selectedAgent) {
          setSelectedAgent(agentsList[0])
        }
      } catch (e) {
        console.error('Failed to load:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    load()
    
    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeSessionCount = sessions.filter(s => s.kind === 'main' || s.kind === 'channel').length

  return (
    <div className="h-screen flex bg-surface-0">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border-subtle bg-surface-1">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border-subtle">
          <Terminal className="w-6 h-6 text-terminal-500" />
          <span className="font-semibold text-lg">Talon</span>
          <span className="text-xs text-ink-muted ml-auto">OpenClaw UI</span>
        </div>

        {/* Quick Stats */}
        <div className="p-3 border-b border-border-subtle">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-surface-2 rounded-lg p-2">
              <div className="text-lg font-semibold text-terminal-400">{agents.length}</div>
              <div className="text-xs text-ink-muted">Agents</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-2">
              <div className="text-lg font-semibold text-blue-400">{activeSessionCount}</div>
              <div className="text-xs text-ink-muted">Sessions</div>
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-tertiary uppercase tracking-wider">
                Agents
              </span>
              <Link href="/workspaces" className="p-1 hover:bg-surface-3 rounded text-ink-muted">
                <Plus className="w-3 h-3" />
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent)
                    setView('chat')
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedAgent?.id === agent.id
                      ? 'bg-terminal-500/15 text-terminal-400 border border-terminal-500/30'
                      : 'hover:bg-surface-2 text-ink-secondary'
                  }`}
                >
                  <span className="text-lg">{agent.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        agent.status === 'online' ? 'bg-green-400' : 
                        agent.status === 'busy' ? 'bg-yellow-400' : 'bg-zinc-500'
                      }`} />
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blockers */}
        {blockers.length > 0 && (
          <div className="border-t border-border-subtle p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 mb-2">
              <AlertTriangle className="w-3 h-3" />
              Blockers ({blockers.length})
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {blockers.slice(0, 3).map(b => (
                <div key={b.id} className="text-xs text-ink-secondary truncate">
                  • {b.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-border-subtle p-2 space-y-0.5">
          <Link
            href="/system"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <Activity className="w-4 h-4" />
            <span className="text-sm">System Status</span>
          </Link>
          <Link
            href="/workspaces"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm">Workspaces</span>
          </Link>
          <Link
            href="/skills"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm">Skills</span>
          </Link>
          <Link
            href="/cron"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Cron Jobs</span>
          </Link>
          <Link
            href="/channels"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Channels</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 text-ink-secondary"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedAgent ? (
          <ChatPanel
            agentId={selectedAgent.id}
            agentName={selectedAgent.name}
            agentAvatar={selectedAgent.avatar}
            sessionLabel={`talon-${selectedAgent.id}`}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-ink-muted">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-medium mb-2">Welcome to Talon</h2>
              <p className="text-sm">Select an agent to start chatting</p>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Agent Details */}
      {selectedAgent && (
        <aside className="w-72 border-l border-border-subtle bg-surface-1 overflow-y-auto hidden lg:block">
          {/* Agent Info */}
          <div className="p-4 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {selectedAgent.avatar}
              </div>
              <div>
                <h3 className="font-semibold">{selectedAgent.name}</h3>
                <p className="text-xs text-ink-muted">{selectedAgent.id}</p>
              </div>
            </div>
            <p className="text-sm text-ink-secondary">{selectedAgent.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-border-subtle">
            <h4 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Link
                href={`/workspace/${selectedAgent.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-blue-400" />
                Open Workspace
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" />
              </Link>
              <Link
                href={`/workspace/${selectedAgent.id}?panel=memory`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm transition-colors"
              >
                <FileText className="w-4 h-4 text-green-400" />
                Edit Memory
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" />
              </Link>
              <Link
                href={`/command?agent=${selectedAgent.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm transition-colors"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                Spawn Sub-agent
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-border-subtle">
            <h4 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">
              Info
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-tertiary">Status</span>
                <span className={`flex items-center gap-1 ${
                  selectedAgent.status === 'online' ? 'text-green-400' : 'text-ink-muted'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedAgent.status === 'online' ? 'bg-green-400' : 'bg-zinc-500'
                  }`} />
                  {selectedAgent.status}
                </span>
              </div>
              {selectedAgent.memorySize && (
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Memory</span>
                  <span>{selectedAgent.memorySize}</span>
                </div>
              )}
              {selectedAgent.lastActivity && (
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Last Active</span>
                  <span>{selectedAgent.lastActivity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Sessions for this agent */}
          <div className="p-4">
            <h4 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">
              Sessions
            </h4>
            {sessions.filter(s => s.agentId === selectedAgent.id).length === 0 ? (
              <p className="text-sm text-ink-muted">No active sessions</p>
            ) : (
              <div className="space-y-2">
                {sessions
                  .filter(s => s.agentId === selectedAgent.id)
                  .slice(0, 5)
                  .map(session => (
                    <div key={session.key} className="text-xs bg-surface-2 rounded p-2">
                      <div className="font-mono truncate">{session.key}</div>
                      <div className="text-ink-muted mt-1">
                        {session.messageCount || 0} messages
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
