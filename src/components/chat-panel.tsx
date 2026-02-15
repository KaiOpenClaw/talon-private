'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, RotateCcw, Clock, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface ChatPanelProps {
  agentId: string
  agentName: string
  agentAvatar: string
  sessionLabel?: string
  onNewSession?: () => void
}

export default function ChatPanel({ 
  agentId, 
  agentName, 
  agentAvatar, 
  sessionLabel,
  onNewSession 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load session history
  const loadHistory = useCallback(async () => {
    if (!sessionLabel) return
    
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/sessions/history?sessionKey=${encodeURIComponent(sessionLabel)}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages) {
          setMessages(data.messages.map((m: any, i: number) => ({
            id: `hist-${i}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || '',
          })))
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      setLoadingHistory(false)
    }
  }, [sessionLabel])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || sending) return
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)
    
    try {
      const res = await fetch('/api/sessions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          label: sessionLabel,
          message: userMessage.content,
          timeoutSeconds: 180,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.response) {
          const assistantMessage: Message = {
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // Show error
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          role: 'system',
          content: `Error: Failed to send message (${res.status})`,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (e) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const formatTime = (ts: string) => {
    if (!ts) return ''
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
            {agentAvatar}
          </div>
          <div>
            <h2 className="font-medium">{agentName}</h2>
            {sessionLabel && (
              <p className="text-xs text-ink-muted font-mono">{sessionLabel}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={loadingHistory}
            className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary transition-colors"
            title="Refresh history"
          >
            <RotateCcw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="px-3 py-1.5 text-sm bg-surface-3 hover:bg-surface-4 rounded-lg transition-colors"
            >
              /new
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-terminal-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-ink-muted">
            <div className="text-4xl mb-4">{agentAvatar}</div>
            <h3 className="text-lg font-medium mb-2">Chat with {agentName}</h3>
            <p className="text-sm max-w-sm">
              Send a message to start the conversation. The agent will respond with context from memory and tools.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 max-w-3xl">
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm ${
                msg.role === 'user' 
                  ? 'bg-terminal-500/20 text-terminal-400' 
                  : msg.role === 'system'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
              }`}>
                {msg.role === 'user' ? 'Y' : msg.role === 'system' ? '!' : agentAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : agentName}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs text-ink-muted">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
                <div className={`text-sm whitespace-pre-wrap ${
                  msg.role === 'system' ? 'text-red-400' : 'text-ink-secondary'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg flex-shrink-0">
              {agentAvatar}
            </div>
            <div className="bg-surface-2 rounded-lg p-3 border border-border-subtle">
              <Loader2 className="w-4 h-4 animate-spin text-terminal-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-subtle bg-surface-0">
        <div className="flex gap-3 max-w-3xl">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message ${agentName}...`}
            className="flex-1 bg-surface-2 border border-border-default rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-terminal-500/50 focus:ring-1 focus:ring-terminal-500/20 placeholder:text-ink-muted"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex items-center gap-2 px-5 py-3 bg-terminal-600 hover:bg-terminal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
