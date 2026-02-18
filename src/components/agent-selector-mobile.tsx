'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Agent {
  id: string
  name: string
  avatar: string
  description: string
  status: 'online' | 'busy' | 'offline'
}

interface AgentSelectorMobileProps {
  agents: Agent[]
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent) => void
  className?: string
}

export default function AgentSelectorMobile({
  agents,
  selectedAgent,
  onAgentSelect,
  className = ''
}: AgentSelectorMobileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function handleAgentSelect(agent: Agent) {
    onAgentSelect(agent)
    setIsOpen(false)
  }

  if (!selectedAgent) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface-1 hover:bg-surface-2 active:bg-surface-2 rounded-lg border border-border-subtle transition-colors min-h-[44px] w-full"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Currently selected: ${selectedAgent.name}. Tap to switch agents.`}
      >
        <span className="text-lg" aria-hidden="true">{selectedAgent.avatar}</span>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                selectedAgent.status === 'online' ? 'bg-green-400' : 
                selectedAgent.status === 'busy' ? 'bg-yellow-400' : 'bg-zinc-500'
              }`}
              aria-hidden="true"
            />
            <span className="font-medium text-sm truncate">{selectedAgent.name}</span>
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-ink-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-2 border border-border-default rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div 
            role="listbox" 
            aria-label="Agent selection"
            className="py-1"
          >
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                role="option"
                aria-selected={selectedAgent?.id === agent.id}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-3 active:bg-surface-1 transition-colors text-left min-h-[44px] ${
                  selectedAgent?.id === agent.id ? 'bg-terminal-500/10' : ''
                }`}
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">{agent.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        agent.status === 'online' ? 'bg-green-400' : 
                        agent.status === 'busy' ? 'bg-yellow-400' : 'bg-zinc-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-sm truncate">{agent.name}</span>
                  </div>
                  <span className="text-xs text-ink-muted truncate block">{agent.description}</span>
                </div>
                {selectedAgent?.id === agent.id && (
                  <Check className="w-4 h-4 text-terminal-400 flex-shrink-0" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}