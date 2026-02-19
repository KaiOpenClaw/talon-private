import React, { useRef, useEffect } from 'react'
import { FolderOpen, ChevronRight, Activity } from 'lucide-react'

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

interface AgentListProps {
  agents: Agent[]
  selectedAgent: Agent | null
  focusedAgentIndex: number
  onAgentSelect: (agent: Agent) => void
  onAgentFocus: (index: number) => void
  onKeyNavigation: (event: React.KeyboardEvent) => void
}

export function AgentList({ 
  agents, 
  selectedAgent, 
  focusedAgentIndex,
  onAgentSelect, 
  onAgentFocus,
  onKeyNavigation 
}: AgentListProps) {
  const agentListRef = useRef<HTMLDivElement>(null)

  // Scroll focused agent into view
  useEffect(() => {
    if (agentListRef.current) {
      const focusedElement = agentListRef.current.children[focusedAgentIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [focusedAgentIndex])

  if (agents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted p-4">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No agents available</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={agentListRef}
      className="flex-1 overflow-y-auto"
      onKeyDown={onKeyNavigation}
      tabIndex={0}
      role="listbox"
      aria-label="Agent list"
    >
      {agents.map((agent, index) => {
        const isSelected = selectedAgent?.id === agent.id
        const isFocused = focusedAgentIndex === index
        
        return (
          <button
            key={agent.id}
            className={`w-full text-left p-3 border-b border-border-subtle transition-colors flex items-center gap-3 hover:bg-surface-1 ${
              isSelected ? 'bg-terminal-900/30 border-l-2 border-l-terminal-400' : ''
            } ${
              isFocused ? 'ring-1 ring-terminal-400 ring-inset' : ''
            }`}
            onClick={() => onAgentSelect(agent)}
            onFocus={() => onAgentFocus(index)}
            role="option"
            aria-selected={isSelected}
          >
            <div className="flex-shrink-0">
              {agent.avatar ? (
                <img 
                  src={agent.avatar} 
                  alt={`${agent.name} avatar`}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-terminal-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-base truncate">{agent.name}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'online' ? 'bg-green-400' : 
                    agent.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                  {isSelected && <ChevronRight className="w-4 h-4 text-terminal-400" />}
                </div>
              </div>
              
              <div className="text-xs text-ink-muted truncate">{agent.description}</div>
              
              {agent.lastActivity && (
                <div className="text-xs text-ink-faint mt-1">
                  {agent.lastActivity}
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                <FolderOpen className="w-3 h-3 text-ink-muted" />
                <span className="text-xs text-ink-muted truncate">
                  {agent.workdir}
                </span>
                {agent.memorySize && (
                  <span className="text-xs text-ink-faint">
                    ({agent.memorySize})
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}