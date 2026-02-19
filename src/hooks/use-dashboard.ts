import { useState, useEffect, useCallback } from 'react'
import { useRealtimeData } from '@/lib/useWebSocket'
import { logger } from '@/lib/logger'

interface Agent {
  id: string
  name: string
  avatar: string
  description: string
  status: 'online' | 'busy' | 'offline'
  memorySize?: string
  lastActivity?: string
  workdir: string
}

interface Session {
  key: string
  agentId?: string
  kind: string
  lastActivity?: string
  messageCount?: number
}

interface Blocker {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  category?: string
}

export function useDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [view, setView] = useState<'chat' | 'agents' | 'sessions'>('chat')
  const [focusedAgentIndex, setFocusedAgentIndex] = useState(0)
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real-time data hooks
  const {
    data: agents,
    isConnected: agentsConnected
  } = useRealtimeData<Agent[]>('agents', [])

  const {
    data: sessions,
    isConnected: sessionsConnected
  } = useRealtimeData<Session[]>('sessions', [])

  // Load initial data and blockers
  useEffect(() => {
    let mounted = true

    async function loadInitialData() {
      if (!agents || !sessions) return

      try {
        const promises = []
        
        // Load blockers from API
        promises.push(
          fetch('/api/blockers').then(res => res.ok ? res.json() : { blockers: [] })
        )

        if (!mounted) return

        const results = await Promise.all(promises)
        
        if (mounted) {
          const blockersData = results[results.length - 1] // Last is always blockers
          setBlockers(blockersData.blockers || [])
          setLoading(false)

          // Auto-select first agent if none selected and agents available
          if (!selectedAgent && agents.length > 0) {
            setSelectedAgent(agents[0])
          }
        }
      } catch (error) {
        logger.error('Failed to load dashboard data', { 
          component: 'useDashboard',
          error: error instanceof Error ? error.message : String(error)
        })
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadInitialData()
    return () => { mounted = false }
  }, [agents, sessions, selectedAgent])

  // Keyboard navigation for agents
  const handleAgentKeyNavigation = useCallback((event: React.KeyboardEvent) => {
    if (!agents || agents.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedAgentIndex(prev => Math.min(prev + 1, agents.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedAgentIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (agents[focusedAgentIndex]) {
          setSelectedAgent(agents[focusedAgentIndex])
        }
        break
      case 'Home':
        event.preventDefault()
        setFocusedAgentIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedAgentIndex(agents.length - 1)
        break
      default:
        // Letter navigation
        if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
          const letter = event.key.toLowerCase()
          const currentIndex = focusedAgentIndex
          
          // Find next agent starting with this letter
          for (let i = 1; i <= agents.length; i++) {
            const index = (currentIndex + i) % agents.length
            const agent = agents[index]
            if (agent.name.toLowerCase().startsWith(letter)) {
              setFocusedAgentIndex(index)
              break
            }
          }
        }
        break
    }
  }, [agents, focusedAgentIndex])

  // Update focused index when selected agent changes
  useEffect(() => {
    if (selectedAgent && agents) {
      const index = agents.findIndex(agent => agent.id === selectedAgent.id)
      if (index !== -1) {
        setFocusedAgentIndex(index)
      }
    }
  }, [selectedAgent, agents])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Number keys (1-9) for quick agent selection
      if (event.ctrlKey || event.metaKey) {
        if (/^[1-9]$/.test(event.key)) {
          event.preventDefault()
          const index = parseInt(event.key) - 1
          const agent = agents?.[index]
          if (agent) {
            setSelectedAgent(agent)
            setFocusedAgentIndex(index)
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [agents])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Trigger data refresh for real-time hooks
      // This will be handled by the WebSocket reconnection
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Calculated values
  const activeSessionCount = sessions?.filter(s => s.kind === 'main' || s.kind === 'channel').length || 0
  const blockersCount = blockers.length

  return {
    // State
    selectedAgent,
    view,
    focusedAgentIndex,
    blockers,
    loading,
    isRefreshing,
    
    // Data
    agents,
    sessions,
    activeSessionCount,
    blockersCount,
    
    // Actions
    setSelectedAgent,
    setView,
    setFocusedAgentIndex,
    handleAgentKeyNavigation,
    handleRefresh,
    
    // Loading states
    isLoading: loading || !agentsConnected || !sessionsConnected,
    hasErrors: !agentsConnected || !sessionsConnected
  }
}