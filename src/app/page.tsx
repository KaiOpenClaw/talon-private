'use client'

import ChatPanel from '@/components/chat-panel'
import ConditionalMobileNav from '@/components/conditional-mobile-nav'
import { PullToRefresh } from '@/components/mobile/pull-to-refresh'
import PWAInstallPrompt from '@/components/mobile/pwa-install-prompt'
import { MobileBottomNav } from '@/components/mobile/mobile-bottom-nav'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AgentList } from '@/components/dashboard/agent-list'
import { useDashboard } from '@/hooks/use-dashboard'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const {
    selectedAgent,
    view,
    focusedAgentIndex,
    blockers,
    loading,
    isRefreshing,
    agents,
    sessions,
    activeSessionCount,
    blockersCount,
    setSelectedAgent,
    setView,
    setFocusedAgentIndex,
    handleAgentKeyNavigation,
    handleRefresh,
    isLoading,
    hasErrors
  } = useDashboard()
  
  const { openCommandPalette } = useCommandPalette()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-terminal-400" />
          <p className="text-ink-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (hasErrors) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-ink-muted mb-4">Failed to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-terminal-900/30 hover:bg-terminal-900/50 rounded-lg text-terminal-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-surface-0">
      {/* Mobile PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-surface-0 text-ink-base p-2 rounded"
      >
        Skip to main content
      </a>

      {/* Conditional Mobile Navigation - Only loads on mobile devices */}
      <ConditionalMobileNav
        selectedAgent={selectedAgent}
        onAgentSelect={setSelectedAgent}
        agents={agents || []}
        sessions={sessions || []}
        blockers={blockers || []}
        loading={loading}
        focusedAgentIndex={focusedAgentIndex}
        onFocusedAgentChange={setFocusedAgentIndex}
        onKeyNavigation={handleAgentKeyNavigation}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-border-subtle bg-surface-0 flex-shrink-0">
        <DashboardHeader 
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        
        <DashboardStats
          agentCount={agents?.length || 0}
          activeSessionCount={activeSessionCount}
          totalSessions={sessions?.length || 0}
          blockersCount={blockersCount}
        />

        <DashboardNav
          view={view}
          onViewChange={setView}
        />

        <AgentList
          agents={agents || []}
          selectedAgent={selectedAgent}
          focusedAgentIndex={focusedAgentIndex}
          onAgentSelect={setSelectedAgent}
          onAgentFocus={setFocusedAgentIndex}
          onKeyNavigation={handleAgentKeyNavigation}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" id="main-content">
        <PullToRefresh onRefresh={handleRefresh}>
          {view === 'chat' && selectedAgent && (
            <ChatPanel
              agentId={selectedAgent.id}
              agentName={selectedAgent.name}
              agentAvatar={selectedAgent.avatar}
              onNewSession={() => {
                // Handle new session creation
                console.log('Starting new session with', selectedAgent.name)
              }}
            />
          )}
          
          {view === 'chat' && !selectedAgent && (
            <div className="flex-1 flex items-center justify-center bg-surface-1">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-terminal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-terminal-400 text-2xl">💬</span>
                </div>
                <h2 className="text-xl font-semibold text-ink-base mb-2">Select an Agent</h2>
                <p className="text-ink-muted mb-6 max-w-md">
                  Choose an agent from the sidebar to start a conversation or view their workspace.
                </p>
                {agents && agents.length > 0 && (
                  <button
                    onClick={() => setSelectedAgent(agents[0])}
                    className="px-6 py-3 bg-terminal-900/30 hover:bg-terminal-900/50 rounded-lg text-terminal-400 transition-colors"
                  >
                    Chat with {agents[0].name}
                  </button>
                )}
              </div>
            </div>
          )}

          {view === 'agents' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-ink-base mb-6">Agents</h1>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(agents || []).map((agent) => (
                    <div
                      key={agent.id}
                      className="bg-surface-1 rounded-lg p-4 hover:bg-surface-2 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setView('chat')
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {agent.avatar ? (
                          <img 
                            src={agent.avatar} 
                            alt={`${agent.name} avatar`}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-terminal-600 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-ink-base">{agent.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              agent.status === 'online' ? 'bg-green-400' : 
                              agent.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`} />
                            <span className="text-xs text-ink-muted capitalize">{agent.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-ink-muted text-sm mb-3">{agent.description}</p>
                      <div className="text-xs text-ink-faint">
                        Workspace: {agent.workdir}
                        {agent.memorySize && ` (${agent.memorySize})`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'sessions' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-ink-base mb-6">Sessions</h1>
                <div className="space-y-3">
                  {(sessions || []).map((session) => (
                    <div
                      key={session.key}
                      className="bg-surface-1 rounded-lg p-4 hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-ink-base">{session.key}</span>
                        <span className="text-xs text-ink-muted px-2 py-1 bg-surface-2 rounded">
                          {session.kind}
                        </span>
                      </div>
                      {session.agentId && (
                        <div className="text-sm text-ink-muted mb-1">
                          Agent: {session.agentId}
                        </div>
                      )}
                      {session.lastActivity && (
                        <div className="text-xs text-ink-faint">
                          Last activity: {session.lastActivity}
                        </div>
                      )}
                      {session.messageCount && (
                        <div className="text-xs text-ink-faint">
                          Messages: {session.messageCount}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!sessions || sessions.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-ink-muted">No active sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </PullToRefresh>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        sessionCount={activeSessionCount}
        notificationCount={blockersCount}
        currentAgent={selectedAgent?.id}
        onCommandPalette={openCommandPalette}
      />
    </div>
  )
}