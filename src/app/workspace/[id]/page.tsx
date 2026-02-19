'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { 
  ChevronLeft, FileText, FolderOpen, MessageSquare, 
  Zap, Box, Settings, Loader2, Send, Plus, Hash,
  Clock, Activity, Users, Wrench, ChevronRight,
  Play, RotateCcw, Eye, EyeOff, Search
} from 'lucide-react'
import MemoryViewer from '@/components/memory-viewer'
import SpawnPanel from '@/components/spawn-panel'
import WorkspaceChannels from '@/components/workspace-channels'

interface Workspace {
  id: string
  name: string
  description: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
  memorySize?: string
  lastActivity?: string
  model?: string
  workdir: string
}

interface Channel {
  id: string
  name: string
  description?: string
  sessionKey?: string
}

interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  time: string
  channelId: string
}

interface Project {
  id: string
  name: string
  status: string
  progress?: number
}

export default function WorkspacePage() {
  const params = useParams()
  const workspaceId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  
  // Channel state
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  
  // UI state
  const [activePanel, setActivePanel] = useState<'chat' | 'memory' | 'spawn' | 'search'>('chat')
  const [showRightPanel, setShowRightPanel] = useState(true)
  
  // Chat state
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedChannel])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch workspace details
        const agentsRes = await fetch('/api/agents')
        const agentsData = await agentsRes.json()
        const ws = agentsData.agents?.find((a: Workspace) => a.id === workspaceId)
        if (ws) setWorkspace(ws)
        
        // Fetch projects
        const projectsRes = await fetch('/api/projects')
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects?.slice(0, 5) || [])
        
        // Set default channel
        const storedChannels = localStorage.getItem(`talon_channels_${workspaceId}`)
        if (storedChannels) {
          const channels = JSON.parse(storedChannels)
          if (channels.length > 0 && !selectedChannel) {
            setSelectedChannel(channels[0])
          }
        }
      } catch (e) {
        logger.error('Failed to load workspace', {
          component: 'WorkspacePage',
          action: 'load_workspace',
          workspaceId,
          error: e instanceof Error ? e.message : String(e)
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [workspaceId])

  // Load messages for selected channel
  useEffect(() => {
    if (selectedChannel) {
      const stored = localStorage.getItem(`talon_messages_${selectedChannel.id}`)
      if (stored && !messages[selectedChannel.id]) {
        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: JSON.parse(stored)
        }))
      }
    }
  }, [selectedChannel])

  // Save messages when they change
  useEffect(() => {
    if (selectedChannel && messages[selectedChannel.id]) {
      localStorage.setItem(
        `talon_messages_${selectedChannel.id}`,
        JSON.stringify(messages[selectedChannel.id])
      )
    }
  }, [messages, selectedChannel])

  async function sendMessage() {
    if (!inputValue.trim() || sending || !selectedChannel) return
    
    const msg = inputValue.trim()
    setInputValue('')
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString(),
      channelId: selectedChannel.id,
    }
    
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: [...(prev[selectedChannel.id] || []), userMessage]
    }))
    
    setSending(true)
    
    try {
      // Include channel context in the message
      const contextPrefix = `[Channel: #${selectedChannel.name}]\n`
      
      const res = await fetch('/api/sessions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: workspaceId, 
          message: contextPrefix + msg,
          label: `${workspaceId}-${selectedChannel.name}`, // Use channel as session label
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.response) {
          const agentMessage: Message = {
            id: `msg-${Date.now()}-agent`,
            role: 'agent',
            content: data.response,
            time: new Date().toLocaleTimeString(),
            channelId: selectedChannel.id,
          }
          
          setMessages(prev => ({
            ...prev,
            [selectedChannel.id]: [...(prev[selectedChannel.id] || []), agentMessage]
          }))
        }
      }
    } catch (e) {
      logger.error('Send message failed', {
        component: 'WorkspacePage',
        action: 'send_message',
        workspaceId,
        channelId: selectedChannel?.id,
        error: e instanceof Error ? e.message : String(e)
      })
    } finally {
      setSending(false)
    }
  }

  function handleChannelSelect(channel: Channel) {
    setSelectedChannel(channel)
    setActivePanel('chat')
  }

  const channelMessages = selectedChannel ? (messages[selectedChannel.id] || []) : []

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤷</div>
          <h2 className="text-xl font-semibold mb-2">Workspace not found</h2>
          <Link href="/" className="text-terminal-400 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-surface-0 flex flex-col">
      {/* Header */}
      <header className="bg-surface-1 border-b border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
            {workspace.avatar}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{workspace.name}</h1>
              <span className={`w-2 h-2 rounded-full ${
                workspace.status === 'online' ? 'bg-green-400' : 'bg-ink-muted'
              }`} />
              {selectedChannel && (
                <>
                  <span className="text-ink-muted">/</span>
                  <span className="text-ink-secondary flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {selectedChannel.name}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-ink-tertiary">{workspace.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-lg transition-colors ${
                showRightPanel ? 'bg-surface-3 text-ink-primary' : 'text-ink-tertiary hover:bg-surface-3 hover:text-ink-primary'
              }`}
            >
              {showRightPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Channels */}
        <aside className="w-56 bg-surface-1 border-r border-border-subtle flex flex-col overflow-hidden">
          {/* Workspace Info */}
          <div className="p-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm">
                {workspace.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{workspace.name}</div>
                <div className="text-xs text-ink-muted">{workspace.memorySize || 'No memory'}</div>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <WorkspaceChannels
              workspaceId={workspaceId}
              selectedChannelId={selectedChannel?.id}
              onSelectChannel={handleChannelSelect}
            />
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-border-subtle space-y-1">
            <button
              onClick={() => setActivePanel('memory')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                activePanel === 'memory' ? 'bg-green-500/15 text-green-400' : 'text-ink-secondary hover:bg-surface-2'
              }`}
            >
              <FileText className="w-4 h-4" />
              Memory
            </button>
            <button
              onClick={() => setActivePanel('spawn')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                activePanel === 'spawn' ? 'bg-purple-500/15 text-purple-400' : 'text-ink-secondary hover:bg-surface-2'
              }`}
            >
              <Zap className="w-4 h-4" />
              Sub-Agents
            </button>
            <button
              onClick={() => setActivePanel('search')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                activePanel === 'search' ? 'bg-blue-500/15 text-blue-400' : 'text-ink-secondary hover:bg-surface-2'
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activePanel === 'chat' && selectedChannel && (
            <>
              {/* Channel Header */}
              <div className="px-4 py-2 border-b border-border-subtle bg-surface-0">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-ink-muted" />
                  <span className="font-medium">{selectedChannel.name}</span>
                  {selectedChannel.description && (
                    <>
                      <span className="text-ink-muted">|</span>
                      <span className="text-sm text-ink-tertiary">{selectedChannel.description}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center text-ink-muted">
                      <Hash className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Welcome to #{selectedChannel.name}</h3>
                      <p className="text-sm max-w-md">
                        This is the start of the #{selectedChannel.name} channel. 
                        Send a message to begin the conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  channelMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 max-w-3xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-terminal-500/20 text-terminal-400' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {msg.role === 'user' ? 'J' : workspace.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.role === 'user' ? 'You' : workspace.name}</span>
                          <span className="text-xs text-ink-muted">{msg.time}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap text-ink-secondary">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {sending && (
                  <div className="flex gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      {workspace.avatar}
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3 border border-border-subtle">
                      <Loader2 className="w-4 h-4 animate-spin text-terminal-400" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border-subtle p-4 bg-surface-0">
                <div className="flex gap-3 max-w-3xl">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={`Message #${selectedChannel.name}...`}
                    className="flex-1 bg-surface-2 border border-border-default rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-terminal-500/50"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || sending}
                    className="flex items-center gap-2 px-5 py-3 bg-terminal-600 hover:bg-terminal-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activePanel === 'memory' && (
            <div className="flex-1 overflow-hidden">
              <MemoryViewer agentId={workspaceId} />
            </div>
          )}

          {activePanel === 'spawn' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl">
                <SpawnPanel currentAgentId={workspaceId} />
              </div>
            </div>
          )}

          {activePanel === 'search' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl">
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 text-ink-muted opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Search this workspace</h3>
                  <p className="text-sm text-ink-tertiary mb-4">
                    Search through memory, conversations, and files
                  </p>
                  <Link
                    href={`/search?scope=workspace&scopeId=${workspaceId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-600 hover:bg-terminal-500 rounded-lg text-sm font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Open Full Search
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {showRightPanel && (
          <aside className="w-64 bg-surface-1 border-l border-border-subtle overflow-y-auto">
            {/* Workspace Stats */}
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">Workspace</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Status</span>
                  <span className={workspace.status === 'online' ? 'text-green-400' : 'text-ink-muted'}>
                    {workspace.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Memory</span>
                  <span>{workspace.memorySize || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Model</span>
                  <span className="font-mono text-xs">{workspace.model || 'Default'}</span>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Projects</span>
                <button className="p-1 hover:bg-surface-3 rounded">
                  <Plus className="w-3 h-3" />
                </button>
              </h3>
              {projects.length === 0 ? (
                <p className="text-sm text-ink-muted">No projects</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-2 text-sm">
                      <Box className="w-4 h-4 text-orange-400" />
                      <span className="flex-1 truncate">{project.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="p-4">
              <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">Files</h3>
              <div className="space-y-1">
                {['MEMORY.md', 'SOUL.md', 'TOOLS.md', 'memory/'].map((file) => (
                  <button
                    key={file}
                    onClick={() => setActivePanel('memory')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-surface-2 rounded text-sm text-left"
                  >
                    {file.endsWith('/') ? (
                      <FolderOpen className="w-4 h-4 text-blue-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-400" />
                    )}
                    <span className="font-mono text-xs">{file}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
