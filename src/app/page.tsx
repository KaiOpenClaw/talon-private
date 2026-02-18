'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Terminal, MessageSquare, Zap, Settings, FileText, 
  Activity, Clock, AlertTriangle, ChevronRight, 
  Loader2, RefreshCw, Users, Calendar, Search,
  FolderOpen, Plus, LogOut, BarChart3
} from 'lucide-react'
import ChatPanel from '@/components/chat-panel'
import { LogoutButton } from '@/components/auth-status'
import { ConnectionStatus } from '@/components/connection-status'
import { useRealtimeData } from '@/lib/useWebSocket'
import MobileNav from '@/components/mobile-nav'
import { logger } from '@/lib/logger'
import { PullToRefresh } from '@/components/mobile/pull-to-refresh'

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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [view, setView] = useState<'chat' | 'agents' | 'sessions'>('chat')
  const [focusedAgentIndex, setFocusedAgentIndex] = useState(0)
  const agentListRef = useRef<HTMLDivElement>(null)

  // Real-time data using WebSocket
  const { 
    data: agents = [], 
    isConnected: agentsConnected,
    refreshData: refreshAgents 
  } = useRealtimeData<Agent[]>('agents', [])
  
  const { 
    data: sessions = [], 
    isConnected: sessionsConnected,
    refreshData: refreshSessions 
  } = useRealtimeData<Session[]>('sessions', [])

  // Fallback loading for static data
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial data and blockers (not real-time yet)
  useEffect(() => {
    let mounted = true
    
    async function loadInitialData() {
      try {
        // Load agents and sessions if WebSocket isn't connected
        const promises = []
        
        if (!agentsConnected && agents.length === 0) {
          promises.push(fetch('/api/agents').then(res => res.json()))
        }
        
        if (!sessionsConnected && sessions.length === 0) {
          promises.push(fetch('/api/sessions/list?activeMinutes=120&limit=20').then(res => res.json()))
        }
        
        // Always load blockers (could be made real-time later)
        promises.push(fetch('/api/blockers').then(res => res.json()))
        
        if (promises.length === 0) {
          setLoading(false)
          return
        }
        
        const results = await Promise.all(promises)
        
        if (!mounted) return
        
        // Process results based on what was loaded
        if (results.length >= 1) {
          const blockersData = results[results.length - 1] // Last is always blockers
          setBlockers(blockersData.blockers || [])
        }
        
      } catch (e) {
        logger.error('Failed to load initial data', { 
          error: e instanceof Error ? e.message : String(e),
          component: 'HomePage',
          action: 'loadInitialData'
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    loadInitialData()
    
    return () => { mounted = false }
  }, [agentsConnected, sessionsConnected, agents.length, sessions.length])

  // Auto-select first agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0])
    }
  }, [agents, selectedAgent])

  // Keyboard navigation for agent list
  const handleAgentKeyNavigation = (event: React.KeyboardEvent) => {
    if (agents.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedAgentIndex(prev => Math.min(prev + 1, agents.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedAgentIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        setSelectedAgent(agents[focusedAgentIndex])
        setView('chat')
        break
      case 'Home':
        event.preventDefault()
        setFocusedAgentIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedAgentIndex(agents.length - 1)
        break
      default:
        // Letter navigation - find agent starting with typed letter
        if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
          const letter = event.key.toLowerCase()
          const currentIndex = focusedAgentIndex
          
          // Look for next agent starting with this letter (wrapping around)
          for (let i = 1; i <= agents.length; i++) {
            const index = (currentIndex + i) % agents.length
            if (agents[index].name.toLowerCase().startsWith(letter)) {
              setFocusedAgentIndex(index)
              break
            }
          }
        }
        break
    }
  }

  // Update focused agent when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      const index = agents.findIndex(agent => agent.id === selectedAgent.id)
      if (index !== -1) {
        setFocusedAgentIndex(index)
      }
    }
  }, [selectedAgent, agents])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette (if implemented)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // TODO: Open command palette
      }
      
      // Alt + number keys for quick agent selection
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault()
        const index = parseInt(event.key) - 1
        if (index < agents.length) {
          setSelectedAgent(agents[index])
          setFocusedAgentIndex(index)
          setView('chat')
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [agents])

  const activeSessionCount = sessions.filter(s => s.kind === 'main' || s.kind === 'channel').length

  // Pull-to-refresh handler for mobile
  const handleRefresh = async () => {
    // Refresh real-time data
    await Promise.all([
      refreshAgents(),
      refreshSessions()
    ])
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-surface-0">
      {/* Skip link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-terminal-500 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Mobile Navigation */}
      <MobileNav
        agents={agents}
        sessions={sessions}
        blockers={blockers}
        selectedAgent={selectedAgent}
        onAgentSelect={setSelectedAgent}
        loading={loading}
        focusedAgentIndex={focusedAgentIndex}
        onFocusedAgentChange={setFocusedAgentIndex}
        onKeyNavigation={handleAgentKeyNavigation}
      />
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside 
        className="hidden lg:flex w-64 flex-col border-r border-border-subtle bg-surface-1"
        role="complementary"
        aria-label="Agent navigation and controls"
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border-subtle">
          <Terminal className="w-6 h-6 text-terminal-500" />
          <span className="font-semibold text-lg">Talon</span>
          <div className="ml-auto flex items-center gap-2">
            <ConnectionStatus variant="icon" />
            <span className="text-xs text-ink-muted">OpenClaw UI</span>
          </div>
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
            <div 
              ref={agentListRef}
              className="px-2 space-y-0.5"
              role="listbox"
              aria-label="Agent list"
              tabIndex={0}
              onKeyDown={handleAgentKeyNavigation}
            >
              {agents.map((agent, index) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent)
                    setView('chat')
                    setFocusedAgentIndex(index)
                  }}
                  onFocus={() => setFocusedAgentIndex(index)}
                  role="option"
                  aria-selected={selectedAgent?.id === agent.id}
                  tabIndex={focusedAgentIndex === index ? 0 : -1}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 ${
                    selectedAgent?.id === agent.id
                      ? 'bg-terminal-500/15 text-terminal-400 border border-terminal-500/30'
                      : focusedAgentIndex === index
                      ? 'bg-surface-2 text-ink-secondary ring-2 ring-terminal-400/50'
                      : 'hover:bg-surface-2 text-ink-secondary'
                  }`}
                  aria-label={`${agent.name} - ${agent.status} - Alt+${index + 1} to select`}
                >
                  <span className="text-lg" aria-hidden="true">{agent.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-2 h-2 rounded-full ${
                          agent.status === 'online' ? 'bg-green-400' : 
                          agent.status === 'busy' ? 'bg-yellow-400' : 'bg-zinc-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                    </div>
                    <span className="sr-only">Status: {agent.status}</span>
                  </div>
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-ink-muted">
                <div>💡 Navigation tips:</div>
                <div>↑↓ arrows to navigate • Enter to select</div>
                <div>Alt+1-9 for quick selection • Type letter to jump</div>
              </div>
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
        <nav 
          className="border-t border-border-subtle p-2 space-y-0.5" 
          role="navigation" 
          aria-label="Main navigation"
        >
          <Link
            href="/system"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="System Status - View health monitoring dashboard"
          >
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">System Status</span>
          </Link>
          <Link
            href="/performance"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Performance - Monitor AI agent performance and response times"
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Performance</span>
          </Link>
          <Link
            href="/workspaces"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Workspaces - Browse all agent workspaces"
          >
            <FolderOpen className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Workspaces</span>
          </Link>
          <Link
            href="/skills"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Skills - Manage capability packages"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Skills</span>
          </Link>
          <Link
            href="/cron"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Cron Jobs - Schedule and monitor automated tasks"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Cron Jobs</span>
          </Link>
          <Link
            href="/channels"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Channels - Manage messaging platforms"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Channels</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Search - Semantic search across all agents - Press Cmd+K for quick access"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Search</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors"
            aria-label="Settings - Configure Talon preferences"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Settings</span>
          </Link>
          <div className="pt-2 mt-2 border-t border-border-subtle">
            <LogoutButton className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-sm transition-colors" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main 
        id="main-content" 
        className="flex-1 flex flex-col min-w-0"
        role="main"
        aria-label={selectedAgent ? `Chat with ${selectedAgent.name}` : "Agent selection"}
      >
        {/* Mobile: Wrap content with pull-to-refresh */}
        <div className="lg:hidden h-full">
          <PullToRefresh
            onRefresh={handleRefresh}
            className="h-full"
            threshold={80}
            resistance={0.6}
          >
            {selectedAgent ? (
              <ChatPanel
                agentId={selectedAgent.id}
                agentName={selectedAgent.name}
                agentAvatar={selectedAgent.avatar}
                sessionLabel={`talon-${selectedAgent.id}`}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-full">
                <div className="text-center text-ink-muted p-8">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                  <h1 className="text-lg font-medium mb-2">Welcome to Talon</h1>
                  <p className="text-sm mb-4">
                    Select an agent from the menu to start chatting
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    💡 Pull down to refresh • Swipe from left edge to open menu
                  </p>
                </div>
              </div>
            )}
          </PullToRefresh>
        </div>

        {/* Desktop: Standard content without pull-to-refresh */}
        <div className="hidden lg:flex lg:flex-col lg:h-full">
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
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                <h1 className="text-lg font-medium mb-2">Welcome to Talon</h1>
                <p className="text-sm">
                  Select an agent from the sidebar to start chatting
                </p>
                <p className="text-xs mt-4 text-ink-tertiary">
                  💡 Use Tab to navigate, arrow keys in agent list, or Alt+1-9 for quick selection
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - Agent Details - Hidden on mobile and tablet */}
      {selectedAgent && (
        <aside 
          className="w-72 border-l border-border-subtle bg-surface-1 overflow-y-auto hidden xl:block"
          role="complementary"
          aria-label={`${selectedAgent.name} details and actions`}
        >
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
            <div className="space-y-2" role="group" aria-label="Agent quick actions">
              <Link
                href={`/workspace/${selectedAgent.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 focus:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-sm transition-colors"
                aria-label={`Open workspace for ${selectedAgent.name} - Browse files and memory`}
              >
                <FolderOpen className="w-4 h-4 text-blue-400" aria-hidden="true" />
                Open Workspace
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" aria-hidden="true" />
              </Link>
              <Link
                href={`/workspace/${selectedAgent.id}?panel=memory`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 focus:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-sm transition-colors"
                aria-label={`Edit memory files for ${selectedAgent.name} - Modify MEMORY.md and session logs`}
              >
                <FileText className="w-4 h-4 text-green-400" aria-hidden="true" />
                Edit Memory
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" aria-hidden="true" />
              </Link>
              <Link
                href={`/command?agent=${selectedAgent.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 focus:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-sm transition-colors"
                aria-label={`Spawn sub-agent from ${selectedAgent.name} - Create isolated task runner`}
              >
                <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />
                Spawn Sub-agent
                <ChevronRight className="w-4 h-4 ml-auto text-ink-muted" aria-hidden="true" />
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
