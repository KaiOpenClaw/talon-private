'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Home,
  Bot,
  Calendar,
  Zap,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  FileText,
  Folder,
  ArrowRight,
  Command,
  CornerDownLeft,
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  category: 'navigation' | 'agents' | 'actions' | 'search'
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  agents?: Array<{ id: string; name: string; status?: string }>
}

export function CommandPalette({ agents = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Build command list
  const commands: CommandItem[] = useMemo(() => {
    const navCommands: CommandItem[] = [
      {
        id: 'home',
        title: 'Go to Dashboard',
        description: 'Main mission control view',
        icon: <Home className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/'),
        keywords: ['home', 'dashboard', 'main'],
      },
      {
        id: 'search',
        title: 'Semantic Search',
        description: 'Search across all agent memories',
        icon: <Search className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/search'),
        keywords: ['search', 'find', 'query', 'memory'],
      },
      {
        id: 'skills',
        title: 'Skills Dashboard',
        description: 'Manage capability packs',
        icon: <Zap className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/skills'),
        keywords: ['skills', 'capabilities', 'tools'],
      },
      {
        id: 'cron',
        title: 'Cron Dashboard',
        description: 'Scheduled jobs & automation',
        icon: <Calendar className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/cron'),
        keywords: ['cron', 'schedule', 'jobs', 'automation', 'tasks'],
      },
      {
        id: 'channels',
        title: 'Channels Dashboard',
        description: 'Multi-platform messaging',
        icon: <MessageSquare className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/channels'),
        keywords: ['channels', 'messaging', 'discord', 'telegram'],
      },
      {
        id: 'status',
        title: 'System Status',
        description: 'Health & performance metrics',
        icon: <Activity className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/status'),
        keywords: ['status', 'health', 'system', 'metrics'],
      },
      {
        id: 'sessions',
        title: 'Sessions',
        description: 'View active sessions',
        icon: <FileText className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/sessions'),
        keywords: ['sessions', 'conversations', 'history'],
      },
    ]

    const agentCommands: CommandItem[] = agents.map(agent => ({
      id: `agent-${agent.id}`,
      title: agent.name || agent.id,
      description: `Open ${agent.id} workspace`,
      icon: <Bot className="w-4 h-4" />,
      category: 'agents',
      action: () => router.push(`/workspace/${agent.id}`),
      keywords: [agent.id, agent.name || '', 'agent', 'workspace'],
    }))

    const actionCommands: CommandItem[] = [
      {
        id: 'new-chat',
        title: 'New Chat',
        description: 'Start a new conversation',
        icon: <MessageSquare className="w-4 h-4" />,
        category: 'actions',
        action: () => {
          // Focus chat input on main page
          router.push('/')
          setTimeout(() => {
            const chatInput = document.querySelector('textarea[placeholder*="Send"]')
            if (chatInput instanceof HTMLTextAreaElement) {
              chatInput.focus()
            }
          }, 100)
        },
        keywords: ['chat', 'message', 'send', 'new'],
      },
      {
        id: 'refresh',
        title: 'Refresh Data',
        description: 'Reload all dashboard data',
        icon: <Activity className="w-4 h-4" />,
        category: 'actions',
        action: () => window.location.reload(),
        keywords: ['refresh', 'reload', 'update'],
      },
      {
        id: 'logout',
        title: 'Sign Out',
        description: 'End your session',
        icon: <LogOut className="w-4 h-4" />,
        category: 'actions',
        action: () => router.push('/api/auth/logout'),
        keywords: ['logout', 'signout', 'exit'],
      },
    ]

    return [...navCommands, ...agentCommands, ...actionCommands]
  }, [agents, router])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const searchTerms = query.toLowerCase().split(' ')
    return commands.filter(cmd => {
      const searchText = [
        cmd.title,
        cmd.description || '',
        ...(cmd.keywords || []),
      ].join(' ').toLowerCase()

      return searchTerms.every(term => searchText.includes(term))
    })
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      agents: [],
      actions: [],
    }
    
    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd)
      }
    })

    return groups
  }, [filteredCommands])

  // Keyboard handler for opening palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  // Keyboard navigation within palette
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          setIsOpen(false)
        }
        break
    }
  }, [filteredCommands, selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const executeCommand = useCallback((cmd: CommandItem) => {
    cmd.action()
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
        title="Command palette (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-zinc-700/50 rounded text-zinc-500">
          <Command className="w-2.5 h-2.5" />
          K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="fixed inset-x-4 top-[20vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50">
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <Search className="w-5 h-5 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands, agents, pages..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-500 border border-zinc-700">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">
                No commands found for "{query}"
              </div>
            ) : (
              <>
                {/* Navigation */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Navigation
                    </div>
                    {groupedCommands.navigation.map((cmd, i) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Agents */}
                {groupedCommands.agents.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Agents ({groupedCommands.agents.length})
                    </div>
                    {groupedCommands.agents.map((cmd, i) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Actions */}
                {groupedCommands.actions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </div>
                    {groupedCommands.actions.map((cmd, i) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
                select
              </span>
            </div>
            <span className="text-amber-500/60">⌘K anywhere</span>
          </div>
        </div>
      </div>
    </>
  )
}

function CommandRow({
  command,
  isSelected,
  onClick,
}: {
  command: CommandItem
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      data-selected={isSelected}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
        ${isSelected 
          ? 'bg-amber-500/20 text-amber-200' 
          : 'text-zinc-300 hover:bg-zinc-800'
        }
      `}
    >
      <span className={isSelected ? 'text-amber-400' : 'text-zinc-500'}>
        {command.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{command.title}</div>
        {command.description && (
          <div className="text-xs text-zinc-500 truncate">{command.description}</div>
        )}
      </div>
      {isSelected && (
        <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
      )}
    </button>
  )
}

// Provider component to fetch agents and provide them to palette
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAgents(data.agents || data || []))
      .catch(() => [])
  }, [])

  return (
    <>
      {children}
      <CommandPalette agents={agents} />
    </>
  )
}
