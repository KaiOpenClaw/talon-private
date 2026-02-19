'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Terminal, ChevronLeft, Zap, MessageSquare, 
  Activity, Clock, AlertTriangle, Box
} from 'lucide-react'
import SpawnPanel from '@/components/spawn-panel'
import { LazySessionsList } from '@/components/lazy-dashboard-components'
import { useBlockers } from '@/lib/hooks'

export default function CommandPage() {
  const [selectedView, setSelectedView] = useState<'spawn' | 'sessions' | 'both'>('both')
  const { blockers } = useBlockers(30000)
  
  const highPriorityBlockers = blockers.filter(b => b.priority === 'high')

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
                <Terminal className="w-5 h-5 text-terminal-500" />
                Command Center
              </h1>
              <p className="text-sm text-ink-tertiary">
                Cross-agent orchestration and session management
              </p>
            </div>
            
            {/* View toggle */}
            <div className="flex bg-surface-2 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('both')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedView === 'both' ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setSelectedView('spawn')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedView === 'spawn' ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                Spawn
              </button>
              <button
                onClick={() => setSelectedView('sessions')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedView === 'sessions' ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                Sessions
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border-subtle bg-surface-1/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-ink-tertiary">System:</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-ink-tertiary">Spawn ready</span>
            </div>
            {highPriorityBlockers.length > 0 && (
              <div className="flex items-center gap-2 text-status-busy">
                <AlertTriangle className="w-4 h-4" />
                <span>{highPriorityBlockers.length} blockers need attention</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 ${selectedView === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
          {/* Spawn Panel */}
          {(selectedView === 'both' || selectedView === 'spawn') && (
            <div>
              <SpawnPanel />
            </div>
          )}

          {/* Sessions List */}
          {(selectedView === 'both' || selectedView === 'sessions') && (
            <div>
              <LazySessionsList />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink-tertiary uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-surface-1 rounded-xl border border-border-subtle hover:border-terminal-500/30 transition-colors"
            >
              <div className="w-10 h-10 bg-terminal-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-terminal-400" />
              </div>
              <div>
                <div className="font-medium">Chat</div>
                <div className="text-xs text-ink-muted">Talk to agents</div>
              </div>
            </Link>
            
            <Link
              href="/agents"
              className="flex items-center gap-3 p-4 bg-surface-1 rounded-xl border border-border-subtle hover:border-terminal-500/30 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Agents</div>
                <div className="text-xs text-ink-muted">View all agents</div>
              </div>
            </Link>
            
            <Link
              href="/projects"
              className="flex items-center gap-3 p-4 bg-surface-1 rounded-xl border border-border-subtle hover:border-terminal-500/30 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-medium">Projects</div>
                <div className="text-xs text-ink-muted">Track progress</div>
              </div>
            </Link>
            
            <Link
              href="/schedule"
              className="flex items-center gap-3 p-4 bg-surface-1 rounded-xl border border-border-subtle hover:border-terminal-500/30 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Schedule</div>
                <div className="text-xs text-ink-muted">Cron jobs</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Blockers Section */}
        {highPriorityBlockers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-status-busy uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Blockers Requiring Attention
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highPriorityBlockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className="p-4 bg-status-error/5 border border-status-error/20 rounded-xl"
                >
                  <div className="font-medium text-red-300">{blocker.text}</div>
                  {blocker.owner && (
                    <div className="text-xs text-ink-muted mt-1">Owner: {blocker.owner}</div>
                  )}
                  {blocker.category && (
                    <div className="text-xs text-ink-muted">{blocker.category}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
