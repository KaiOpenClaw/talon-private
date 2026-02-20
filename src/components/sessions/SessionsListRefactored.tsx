'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { InlineErrorBoundary } from '@/components/enhanced-error-boundary'
import { SessionCard } from './SessionCard'
import { SessionsHeader } from './SessionsHeader'
import { SessionsEmptyState } from './SessionsEmptyState'
import { useSessionsData } from './useSessionsData'

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
  const { sessions, loading, error, wsConnected, refetchSessions } = useSessionsData()
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const toggleExpanded = (sessionKey: string) => {
    setExpandedSession(current => current === sessionKey ? null : sessionKey)
  }

  const handleSelectSession = (session: Session) => {
    onSelectSession?.(session)
  }

  return (
    <InlineErrorBoundary
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span>Failed to load sessions. Please refresh the page.</span>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <SessionsHeader
          loading={loading}
          error={error}
          sessionCount={sessions.length}
          wsConnected={wsConnected}
          onRefresh={refetchSessions}
        />

        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <SessionsEmptyState />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.key}
                session={session}
                isSelected={selectedSessionKey === session.key}
                isExpanded={expandedSession === session.key}
                onSelect={() => handleSelectSession(session)}
                onToggleExpand={() => toggleExpanded(session.key)}
              />
            ))}
          </div>
        )}
      </div>
    </InlineErrorBoundary>
  )
}