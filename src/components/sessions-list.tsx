'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MessageSquare, Clock, Users, ChevronRight, 
  Loader2, RefreshCw, Zap, Send, AlertCircle, WifiOff
} from 'lucide-react'
import { logger } from '@/lib/logger'
import { useSafeApiCall } from '@/hooks/useSafeApiCall'
import { InlineErrorBoundary } from '@/components/enhanced-error-boundary'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Session {
  key: string
  kind: string
  agentId?: string
  model?: string
  channel?: string
  lastActivity?: string
  messageCount?: number
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

interface SessionsListProps {
  onSelectSession?: (session: Session) => void
  selectedSessionKey?: string
}

export default function SessionsList({ onSelectSession, selectedSessionKey }: SessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const safeApiCall = useSafeApiCall()
  const { toast } = useToast()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await safeApiCall(
      async () => {
        logger.debug('Fetching active sessions', { 
          activeMinutes: 60, 
          messageLimit: 3,
          retryCount 
        })
        
        const res = await fetch('/api/sessions/list?activeMinutes=60&messageLimit=3')
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        return data.sessions || []
      },
      {
        component: 'SessionsList',
        errorMessage: 'Failed to load sessions',
        showToast: retryCount > 0 // Only show toast after first failure
      }
    )

    if (result.isSuccess && result.data) {
      setSessions(result.data)
      setError(null)
      setRetryCount(0)
      
      logger.info('Sessions loaded successfully', {
        component: 'SessionsList',
        action: 'fetchSessions',
        count: result.data.length
      })
    } else if (result.error) {
      setError(result.error.message)
      setRetryCount(prev => prev + 1)
      setSessions([]) // Clear stale data
    }
    
    setLoading(false)
  }, [safeApiCall, retryCount])

  useEffect(() => {
    fetchSessions()
    // Auto-refresh every 10 seconds (but slower if there are errors)
    const refreshInterval = error ? 30000 : 10000 // 30s if error, 10s if working
    const interval = setInterval(fetchSessions, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchSessions, error])

  function formatTime(iso?: string): string {
    if (!iso) return ''
    const date = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const mainSessions = sessions.filter(s => s.kind === 'main')
  const isolatedSessions = sessions.filter(s => s.kind === 'isolated')

  return (
    <InlineErrorBoundary component="SessionsList">
      <div className="bg-surface-1 rounded-xl border border-border-subtle overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Active Sessions</span>
            {error && retryCount > 0 && (
              <WifiOff className="w-4 h-4 text-red-400" title="Connection issues" />
            )}
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
              {sessions.length}
            </span>
          </div>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className={`p-1.5 rounded text-ink-tertiary hover:text-ink-primary disabled:opacity-50 transition-colors ${
              error ? 'hover:bg-red-100 text-red-500' : 'hover:bg-surface-3'
            }`}
            title={error ? `Retry (${retryCount} attempts)` : 'Refresh sessions'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Session List */}
        <div className="max-h-96 overflow-y-auto">
          {/* Error State */}
          {error && sessions.length === 0 && !loading && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="font-medium text-red-600 mb-2">Connection Problem</h4>
              <p className="text-sm text-red-500 mb-4">
                Unable to load sessions. {retryCount > 1 && `(${retryCount} attempts)`}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={fetchSessions}
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Loading State (first load) */}
          {loading && sessions.length === 0 && !error && (
            <div className="flex items-center justify-center py-8 text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading sessions...</span>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && sessions.length === 0 && (
            <div className="py-8 text-center text-ink-muted text-sm">
              No active sessions
            </div>
          )}
          
          {/* Connection Issues Banner (when we have stale data) */}
          {error && sessions.length > 0 && (
            <div className="mx-4 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center gap-2">
              <WifiOff className="w-3 h-3" />
              Connection issues. Showing cached data.
              <button 
                onClick={fetchSessions}
                className="underline hover:no-underline ml-auto"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Session List - Only show if we have sessions */}
          {sessions.length > 0 && (
          <>
            {/* Main Sessions */}
            {mainSessions.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-surface-2 text-xs font-medium text-ink-tertiary uppercase tracking-wider">
                  Main Sessions
                </div>
                {mainSessions.map((session) => (
                  <SessionItem
                    key={session.key}
                    session={session}
                    isSelected={selectedSessionKey === session.key}
                    isExpanded={expandedSession === session.key}
                    onSelect={() => onSelectSession?.(session)}
                    onToggleExpand={() => setExpandedSession(
                      expandedSession === session.key ? null : session.key
                    )}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}

            {/* Isolated/Spawned Sessions */}
            {isolatedSessions.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-surface-2 text-xs font-medium text-ink-tertiary uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 text-purple-400" />
                  Spawned Sessions
                </div>
                {isolatedSessions.map((session) => (
                  <SessionItem
                    key={session.key}
                    session={session}
                    isSelected={selectedSessionKey === session.key}
                    isExpanded={expandedSession === session.key}
                    onSelect={() => onSelectSession?.(session)}
                    onToggleExpand={() => setExpandedSession(
                      expandedSession === session.key ? null : session.key
                    )}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </>
          )}
      </div>
    </div>
    </InlineErrorBoundary>
  )
}

function SessionItem({ 
  session, 
  isSelected, 
  isExpanded,
  onSelect, 
  onToggleExpand,
  formatTime 
}: {
  session: Session
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  formatTime: (iso?: string) => string
}) {
  const [quickMessage, setQuickMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function handleQuickSend() {
    if (!quickMessage.trim()) return
    
    setSending(true)
    const startTime = Date.now()
    try {
      logger.debug('Sending quick message', { 
        sessionKey: session.key,
        messageLength: quickMessage.trim().length 
      })
      
      await fetch('/api/sessions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: session.key,
          message: quickMessage.trim(),
        }),
      })
      setQuickMessage('')
      
      logger.info('Quick message sent successfully', {
        sessionKey: session.key,
        duration: Date.now() - startTime
      })
    } catch (error) {
      logger.error('Failed to send quick message', {
        component: 'SessionItem',
        action: 'handleQuickSend',
        sessionKey: session.key,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`border-b border-border-subtle last:border-0 ${isSelected ? 'bg-terminal-500/5' : ''}`}>
      <div
        className="px-4 py-3 hover:bg-surface-2/50 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="p-0.5 hover:bg-surface-3 rounded mt-0.5"
          >
            <ChevronRight className={`w-4 h-4 text-ink-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${
                session.kind === 'isolated' ? 'text-purple-400' : 'text-terminal-400'
              }`}>
                {session.agentId || 'default'}
              </span>
              <span className="text-xs text-ink-muted">•</span>
              <span className="text-xs text-ink-muted truncate">{session.key}</span>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
              {session.channel && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {session.channel}
                </span>
              )}
              {session.lastActivity && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(session.lastActivity)}
                </span>
              )}
              {session.messageCount !== undefined && (
                <span>{session.messageCount} messages</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-3 pl-12 space-y-3">
          {/* Recent messages */}
          {session.messages && session.messages.length > 0 && (
            <div className="space-y-2">
              {session.messages.slice(-3).map((msg, i) => (
                <div key={i} className={`text-xs p-2 rounded ${
                  msg.role === 'user' ? 'bg-surface-3' : 'bg-terminal-500/10'
                }`}>
                  <div className="font-medium text-ink-muted mb-1">
                    {msg.role === 'user' ? 'User' : 'Agent'}
                  </div>
                  <div className="line-clamp-2 text-ink-secondary">{msg.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick send */}
          <div className="flex gap-2">
            <input
              type="text"
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              placeholder="Quick message..."
              className="flex-1 bg-surface-2 border border-border-default rounded px-2 py-1 text-xs focus:outline-none focus:border-terminal-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickSend()}
            />
            <button
              onClick={handleQuickSend}
              disabled={!quickMessage.trim() || sending}
              className="p-1.5 bg-terminal-600 hover:bg-terminal-500 disabled:opacity-50 rounded text-white"
            >
              {sending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
