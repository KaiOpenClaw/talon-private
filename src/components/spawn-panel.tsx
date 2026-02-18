'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, Play, Loader2, CheckCircle, XCircle, 
  ChevronDown, ChevronRight, Clock, Users, X
} from 'lucide-react'
import { useSpawnedSessions } from '@/lib/realtime'
import { logApiError } from '@/lib/logger'

interface SpawnPanelProps {
  currentAgentId?: string
  onClose?: () => void
}

interface Agent {
  id: string
  name: string
  avatar: string
}

export default function SpawnPanel({ currentAgentId, onClose }: SpawnPanelProps) {
  const [task, setTask] = useState('')
  const [targetAgent, setTargetAgent] = useState<string>('')
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [model, setModel] = useState('')
  const [timeout, setTimeout] = useState(300)
  
  const { sessions, spawn, clear } = useSpawnedSessions()
  const [spawning, setSpawning] = useState(false)

  // Fetch available agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents')
        const data = await res.json()
        setAvailableAgents(data.agents || [])
      } catch (e) {
        logApiError(e, {
          component: 'SpawnPanel',
          action: 'fetchAgents',
          endpoint: '/api/agents'
        })
      }
    }
    fetchAgents()
  }, [])

  async function handleSpawn() {
    if (!task.trim()) return
    
    setSpawning(true)
    try {
      await spawn({
        task: task.trim(),
        agentId: targetAgent || undefined,
        model: model || undefined,
      })
      setTask('')
    } finally {
      setSpawning(false)
    }
  }

  const runningCount = sessions.filter(s => s.status === 'running').length
  const completedCount = sessions.filter(s => s.status === 'completed').length

  return (
    <div className="bg-surface-1 rounded-xl border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="font-medium">Spawn Sub-Agent</span>
          {runningCount > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {runningCount} running
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-surface-3 rounded">
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        )}
      </div>

      {/* Spawn Form */}
      <div className="p-4 space-y-4">
        {/* Task input */}
        <div>
          <label className="block text-xs text-ink-muted uppercase tracking-wider mb-2">
            Task Description
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want the sub-agent to do..."
            className="w-full bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Target agent */}
        <div>
          <label className="block text-xs text-ink-muted uppercase tracking-wider mb-2">
            Target Agent (optional)
          </label>
          <select
            value={targetAgent}
            onChange={(e) => setTargetAgent(e.target.value)}
            className="w-full bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Default (inherit from current)</option>
            {availableAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.avatar} {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-ink-tertiary hover:text-ink-secondary"
        >
          {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Advanced options
        </button>

        {showAdvanced && (
          <div className="space-y-3 pl-4 border-l-2 border-border-subtle">
            <div>
              <label className="block text-xs text-ink-muted mb-1">Model override</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., claude-sonnet-4-20250514"
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-muted mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(parseInt(e.target.value) || 300)}
                className="w-24 bg-surface-2 border border-border-default rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        )}

        {/* Spawn button */}
        <button
          onClick={handleSpawn}
          disabled={!task.trim() || spawning}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          {spawning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Spawning...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Spawn Agent
            </>
          )}
        </button>
      </div>

      {/* Active/Recent Spawns */}
      {sessions.length > 0 && (
        <div className="border-t border-border-subtle">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-2">
            <span className="text-xs font-medium text-ink-tertiary uppercase tracking-wider">
              Recent Spawns
            </span>
            <button
              onClick={clear}
              className="text-xs text-ink-muted hover:text-ink-secondary"
            >
              Clear
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {sessions.slice().reverse().map((session, i) => (
              <div
                key={session.sessionKey}
                className="px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-surface-2/50"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    session.status === 'running' ? 'bg-purple-500/20 text-purple-400' :
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {session.status === 'running' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : session.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2">{session.task}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                      {session.agentId && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.agentId}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {session.result && (
                      <div className={`mt-2 text-xs p-2 rounded ${
                        session.status === 'error' ? 'bg-red-500/10 text-red-300' : 'bg-surface-3 text-ink-secondary'
                      }`}>
                        <pre className="whitespace-pre-wrap line-clamp-4">{session.result}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
