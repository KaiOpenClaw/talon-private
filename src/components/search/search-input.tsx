/**
 * Search input component with voice search and agent filtering
 */

'use client'

import { Search, Loader2, Database } from 'lucide-react'
import { VoiceSearchInput } from '@/components/mobile/voice-search'
import type { SearchInputProps } from './types'

export function SearchInput({
  query,
  onQueryChange,
  agentFilter,
  onAgentFilterChange,
  agents,
  searching,
  onSearch,
  onShowIndexPanel
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted z-10 pointer-events-none" />
        <VoiceSearchInput
          value={query}
          onChange={onQueryChange}
          onVoiceComplete={(transcript) => {
            onQueryChange(transcript)
            // Auto-search when voice input is complete
            setTimeout(onSearch, 100)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search across agent workspaces..."
          className="pl-10 bg-surface-2 border-border-default focus:border-terminal-500/50"
          autoFocus
        />
      </div>
      
      {/* Agent filter */}
      <select
        value={agentFilter}
        onChange={(e) => onAgentFilterChange(e.target.value)}
        className="px-4 py-3 bg-surface-2 border border-border-default rounded-lg text-sm focus:outline-none focus:border-terminal-500/50 min-w-[140px]"
      >
        <option value="">All Agents</option>
        {agents.map(agent => (
          <option key={agent} value={agent}>{agent}</option>
        ))}
      </select>
      
      <button
        onClick={onSearch}
        disabled={!query.trim() || searching}
        className="flex items-center gap-2 px-5 py-3 bg-terminal-600 hover:bg-terminal-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
      >
        {searching ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
        Search
      </button>
      
      <button
        onClick={onShowIndexPanel}
        className="p-3 bg-surface-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary"
        title="Index Management"
      >
        <Database className="w-4 h-4" />
      </button>
    </div>
  )
}