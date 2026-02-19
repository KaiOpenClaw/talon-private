'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Terminal, MessageSquare, Zap, Settings, FileText, 
  Activity, Clock, AlertTriangle, ChevronRight, 
  Loader2, RefreshCw, Users, Calendar, Search,
  FolderOpen, Plus, LogOut, Menu, X, Shield
} from 'lucide-react'
import { LogoutButton } from '@/components/auth-status'
import { ConnectionStatus } from '@/components/connection-status'
import { Agent, Session, Blocker } from '@/lib/hooks'

interface MobileNavProps {
  agents: Agent[]
  sessions: Session[]
  blockers: Blocker[]
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent) => void
  loading?: boolean
  focusedAgentIndex: number
  onFocusedAgentChange: (index: number) => void
  onKeyNavigation: (event: React.KeyboardEvent) => void
}

export default function MobileNav({
  agents,
  sessions,
  blockers,
  selectedAgent,
  onAgentSelect,
  loading,
  focusedAgentIndex,
  onFocusedAgentChange,
  onKeyNavigation
}: MobileNavProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const activeSessionCount = sessions.filter(s => s.kind === 'main' || s.kind === 'channel').length

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false)
      }
    }

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent scroll on body
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isDrawerOpen])

  // Close drawer on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isDrawerOpen])

  // Handle swipe to open/close (basic touch support)
  useEffect(() => {
    let startX = 0
    let startY = 0
    let isTracking = false

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length === 1) {
        startX = event.touches[0].clientX
        startY = event.touches[0].clientY
        isTracking = true
      }
    }

    function handleTouchEnd(event: TouchEvent) {
      if (!isTracking) return
      
      const endX = event.changedTouches[0].clientX
      const endY = event.changedTouches[0].clientY
      const deltaX = endX - startX
      const deltaY = endY - startY

      // Only trigger if horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && startX < 20 && !isDrawerOpen) {
          // Swipe right from left edge - open drawer
          setIsDrawerOpen(true)
        } else if (deltaX < 0 && isDrawerOpen) {
          // Swipe left while drawer is open - close drawer
          setIsDrawerOpen(false)
        }
      }

      isTracking = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDrawerOpen])

  function handleAgentSelect(agent: Agent) {
    onAgentSelect(agent)
    setIsDrawerOpen(false) // Close drawer after selection
  }

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-1">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
          aria-controls="mobile-drawer"
        >
          <Menu className="w-5 h-5 text-ink-secondary" />
        </button>

        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-terminal-500" />
          <span className="font-semibold">Talon</span>
          {selectedAgent && (
            <>
              <span className="text-ink-muted">•</span>
              <span className="text-sm text-ink-secondary truncate max-w-32">
                {selectedAgent.name}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatus variant="icon" />
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          ref={overlayRef}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        ref={drawerRef}
        id="mobile-drawer"
        className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-surface-1 border-r border-border-subtle z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Mobile navigation menu"
        aria-hidden={!isDrawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-terminal-500" />
            <span className="font-semibold text-lg">Talon</span>
            <ConnectionStatus variant="icon" />
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-ink-secondary" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border-subtle">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-surface-2 rounded-lg p-3 min-h-[44px] flex flex-col justify-center">
              <div className="text-lg font-semibold text-terminal-400">{agents.length}</div>
              <div className="text-xs text-ink-muted">Agents</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3 min-h-[44px] flex flex-col justify-center">
              <div className="text-lg font-semibold text-blue-400">{activeSessionCount}</div>
              <div className="text-xs text-ink-muted">Sessions</div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Agents List */}
          <div className="py-4">
            <div className="px-4 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-tertiary uppercase tracking-wider">
                  Agents
                </span>
                <Link 
                  href="/workspaces" 
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-3 text-ink-muted transition-colors"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
              </div>
            ) : (
              <div className="px-4 space-y-1">
                {agents.map((agent, index) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    onFocus={() => onFocusedAgentChange(index)}
                    role="option"
                    aria-selected={selectedAgent?.id === agent.id}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 min-h-[44px] ${
                      selectedAgent?.id === agent.id
                        ? 'bg-terminal-500/15 text-terminal-400 border border-terminal-500/30'
                        : 'hover:bg-surface-2 text-ink-secondary active:bg-surface-3'
                    }`}
                    aria-label={`${agent.name} - ${agent.status}`}
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            agent.status === 'online' ? 'bg-green-400' : 
                            agent.status === 'busy' ? 'bg-yellow-400' : 'bg-zinc-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="font-medium truncate">{agent.name}</span>
                      </div>
                      <span className="text-xs text-ink-muted truncate block">{agent.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <div className="px-4 pb-4">
            <div className="mb-3">
              <span className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-0">
                Dashboard
              </span>
            </div>
            <div className="space-y-1">
              <Link
                href="/system"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="System Status - View health monitoring dashboard"
              >
                <Activity className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>System Status</span>
              </Link>
              <Link
                href="/workspaces"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Workspaces - Browse all agent workspaces"
              >
                <FolderOpen className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Workspaces</span>
              </Link>
              <Link
                href="/skills"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Skills - Manage capability packages"
              >
                <Zap className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Skills</span>
              </Link>
              <Link
                href="/cron"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Cron Jobs - Schedule and monitor automated tasks"
              >
                <Calendar className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Cron Jobs</span>
              </Link>
              <Link
                href="/channels"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Channels - Manage messaging platforms"
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Channels</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Search - Semantic search across all agents"
              >
                <Search className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Search</span>
              </Link>
              <Link
                href="/security"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Security - Scan skills and security guidelines"
              >
                <Shield className="w-5 h-5 flex-shrink-0 text-red-400" aria-hidden="true" />
                <span>Security Center</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2 focus:ring-offset-surface-1 text-ink-secondary transition-colors min-h-[44px]"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Settings - Configure Talon preferences"
              >
                <Settings className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Blockers */}
          {blockers.length > 0 && (
            <div className="px-4 pb-4">
              <div className="mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Blockers ({blockers.length})
                </div>
              </div>
              <div className="space-y-2">
                {blockers.slice(0, 3).map(b => (
                  <div key={b.id} className="text-sm text-ink-secondary bg-surface-2 rounded-lg p-3">
                    • {b.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="px-4 pb-4 border-t border-border-subtle pt-4 mt-4">
            <LogoutButton className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-surface-1 transition-colors min-h-[44px]" />
          </div>
        </div>
      </nav>
    </>
  )
}