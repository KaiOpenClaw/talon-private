// Core OpenClaw Types
export interface Agent {
  id: string
  name: string
  status: 'active' | 'inactive' | 'busy'
  workspacePath: string
  lastActivity?: string
  description?: string
}

export interface Session {
  id: string
  agentId: string
  agentName: string
  kind: 'main' | 'isolated'
  lastActivity: string
  messageCount: number
  isActive: boolean
  labels?: string[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sessionId: string
  metadata?: {
    thinking?: string
    model?: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
}

export interface CronJob {
  id: string
  name: string
  schedule: {
    kind: 'at' | 'every' | 'cron'
    expr?: string
    everyMs?: number
    at?: string
  }
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
  }
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status: 'running' | 'idle' | 'error'
}

export interface Channel {
  id: string
  name: string
  type: 'discord' | 'telegram' | 'whatsapp'
  status: 'connected' | 'disconnected' | 'error'
  accounts: Array<{
    id: string
    name: string
    enabled: boolean
  }>
  lastActivity?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  status: 'ready' | 'unavailable' | 'error'
  version?: string
  dependencies?: string[]
  commands?: string[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SystemHealth {
  gateway: {
    status: 'healthy' | 'degraded' | 'down'
    uptime: string
    version: string
  }
  agents: {
    total: number
    active: number
    inactive: number
  }
  sessions: {
    total: number
    active: number
  }
  cron: {
    total: number
    running: number
    failed: number
  }
  channels: {
    total: number
    connected: number
    errors: number
  }
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'session_update' | 'agent_update' | 'cron_update' | 'chat_message' | 'status_update'
  data: unknown
}

// Search Types
export interface SearchResult {
  content: string
  path: string
  line?: number
  score: number
  context?: string
}

export interface IndexStats {
  totalChunks: number
  totalFiles: number
  agents: string[]
  lastIndexed?: string
}