/**
 * Search results display component
 */

'use client'

import { ChevronRight, Search, Brain } from 'lucide-react'
import { getFileTypeIcon } from './search-utils'
import type { SearchResultsProps } from './types'

export function SearchResults({ results, query, onResultClick }: SearchResultsProps) {
  if (results.length === 0) {
    if (query) {
      return (
        <div className="text-center py-8 text-ink-muted">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No results found for &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Try different keywords or index more workspaces</p>
        </div>
      )
    } else {
      return (
        <div className="text-center py-8 text-ink-muted">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Search across agent memories, souls, and tools</p>
          <p className="text-xs mt-1">Uses semantic embeddings for intelligent matching</p>
        </div>
      )
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-ink-muted">
        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </div>
      
      {results.map((result, i) => {
        const typeConfig = getFileTypeIcon(result.document.fileType)
        const Icon = typeConfig.icon
        
        return (
          <div
            key={i}
            onClick={() => onResultClick?.(result)}
            className="group bg-surface-1 rounded-xl border border-border-subtle p-4 hover:border-terminal-500/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeConfig.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-terminal-400">
                    {result.document.agentId}
                  </span>
                  <ChevronRight className="w-3 h-3 text-ink-muted" />
                  <span className="font-mono text-sm text-ink-secondary truncate">
                    {result.document.filePath}
                  </span>
                  {result.document.chunk > 0 && (
                    <span className="text-xs text-ink-muted">
                      (chunk {result.document.chunk + 1})
                    </span>
                  )}
                  <span className="text-xs text-ink-muted ml-auto flex-shrink-0">
                    {Math.round(result.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-ink-secondary line-clamp-3 whitespace-pre-wrap">
                  {result.snippet}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
          </div>
        )
      })}
    </div>
  )
}