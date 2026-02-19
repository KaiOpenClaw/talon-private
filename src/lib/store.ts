import { create } from 'zustand'
import { Agent, Blocker } from './hooks'

interface Message {
  role: 'user' | 'agent' | 'system'
  content: string
  time: string
  toolCalls?: Array<{ name: string; status: 'running' | 'done' | 'error'; result?: string }>
}

interface TalonState {
  // Agents
  agents: Agent[]
  selectedAgentId: string | null
  setAgents: (agents: Agent[]) => void
  selectAgent: (id: string | null) => void
  
  // Blockers
  blockers: Blocker[]
  setBlockers: (blockers: Blocker[]) => void
  
  // Messages per agent
  messages: Record<string, Message[]>
  addMessage: (agentId: string, message: Message) => void
  clearMessages: (agentId: string) => void
  
  // UI state
  sidebarOpen: boolean
  memoryViewerOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMemoryViewerOpen: (open: boolean) => void
  
  // Loading states
  loading: {
    agents: boolean
    blockers: boolean
    sending: boolean
  }
  setLoading: (key: keyof TalonState['loading'], value: boolean) => void
}

export const useStore = create<TalonState>((set) => ({
  // Agents
  agents: [],
  selectedAgentId: null,
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  
  // Blockers
  blockers: [],
  setBlockers: (blockers) => set({ blockers }),
  
  // Messages
  messages: {},
  addMessage: (agentId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [agentId]: [...(state.messages[agentId] || []), message],
    },
  })),
  clearMessages: (agentId) => set((state) => ({
    messages: {
      ...state.messages,
      [agentId]: [],
    },
  })),
  
  // UI state
  sidebarOpen: true,
  memoryViewerOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMemoryViewerOpen: (open) => set({ memoryViewerOpen: open }),
  
  // Loading
  loading: {
    agents: true,
    blockers: true,
    sending: false,
  },
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value },
  })),
}))

// Selectors
export const useSelectedAgent = () => {
  const agents = useStore((s) => s.agents)
  const selectedId = useStore((s) => s.selectedAgentId)
  return agents.find((a) => a.id === selectedId)
}

export const useAgentMessages = (agentId: string) => {
  return useStore((s) => s.messages[agentId] || [])
}

export const useHighPriorityBlockers = () => {
  return useStore((s) => s.blockers.filter((b) => b.priority === 'high'))
}
