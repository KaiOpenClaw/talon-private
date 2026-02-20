'use client'

import { useState } from 'react'
import { MessageSquare, Clock, Users, ChevronRight, Zap, Send } from 'lucide-react'

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

interface SessionCardProps {
  session: Session
  isSelected?: boolean
  isExpanded?: boolean
  onSelect?: () => void
  onToggleExpand?: () => void
}

export function SessionCard({ 
  session, 
  isSelected = false,
  isExpanded = false, 
  onSelect, 
  onToggleExpand 
}: SessionCardProps) {
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Unknown'
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'isolated': return <Zap className="w-4 h-4 text-purple-500" />
      case 'main': return <MessageSquare className="w-4 h-4 text-blue-500" />
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'isolated': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'main': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`
      border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50
      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
    `}>
      <div className="flex items-center justify-between mb-2" onClick={onSelect}>
        <div className="flex items-center space-x-3">
          {getKindIcon(session.kind)}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {session.agentId || 'Unknown Agent'}
              </span>
              <span className={`px-2 py-1 text-xs rounded border ${getKindColor(session.kind)}`}>
                {session.kind}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(session.lastActivity)}
              {session.messageCount !== undefined && (
                <>
                  <span className="mx-2">•</span>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {session.messageCount} messages
                </>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight 
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} 
          />
        </button>
      </div>

      {/* Additional details */}
      {session.model && (
        <div className="text-xs text-gray-500 mb-2">
          Model: {session.model}
        </div>
      )}

      {/* Expanded messages */}
      {isExpanded && session.messages && session.messages.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="space-y-2">
            {session.messages.slice(0, 3).map((msg, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  {msg.role === 'user' ? (
                    <Send className="w-3 h-3 text-blue-500" />
                  ) : (
                    <MessageSquare className="w-3 h-3 text-green-500" />
                  )}
                  <span className="font-medium text-xs capitalize text-gray-600">
                    {msg.role}
                  </span>
                </div>
                <p className="text-gray-700 text-xs pl-5 line-clamp-2">
                  {msg.content.length > 100 
                    ? `${msg.content.substring(0, 100)}...` 
                    : msg.content}
                </p>
              </div>
            ))}
            {session.messages.length > 3 && (
              <div className="text-xs text-gray-500 pl-5">
                +{session.messages.length - 3} more messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}