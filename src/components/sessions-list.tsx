'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, Clock, Users, ChevronRight, 
  Loader2, RefreshCw, Zap, Send
} from 'lucide-react'
import { logger, logApiError } from '@/lib/logger'

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
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  async function fetchSessions() {
    setLoading(true)
    const startTime = Date.now()
    try {
      logger.debug('Fetching active sessions', { activeMinutes: 60, messageLimit: 3 })
      const res = await fetch('/api/sessions/list?activeMinutes=60&messageLimit=3')
      const data = await res.json()
      setSessions(data.sessions || [])
      
      logger.info('Sessions loaded successfully', {
        count: data.sessions?.length || 0,
        duration: Date.now() - startTime
      })
    } catch (error) {
      logApiError(error, { 
        component: 'SessionsList',
        action: 'fetchSessions',
        endpoint: '/api/sessions/list'
      })
      // Could add user-facing error toast here in the future
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="bg-surface-1 rounded-xl border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="font-medium">Active Sessions</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="p-1.5 hover:bg-surface-3 rounded text-ink-tertiary hover:text-ink-primary disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Session List */}
      <div className="max-h-96 overflow-y-auto">
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-ink-muted text-sm">
            No active sessions
          </div>
        ) : (
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
      logApiError(error, {
        component: 'SessionsList',
        action: 'handleQuickSend',
        sessionKey: session.key
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
