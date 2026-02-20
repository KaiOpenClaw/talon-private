/**
 * Main semantic search component - Modular Architecture
 * Split from 421-line monolith into focused, reusable components
 */

'use client'

import { AlertCircle } from 'lucide-react'
import { InlineErrorBoundary } from '@/components/error-boundary'
import { NetworkErrorState } from '@/components/error-state'
import { SearchInput } from './search-input'
import { SearchResults } from './search-results'
import { IndexPanel } from './index-panel'
import { SearchErrorBanner } from './search-error-banner'
import { useSemanticSearch } from './use-semantic-search'
import type { SemanticSearchProps } from './types'

export default function SemanticSearch({ 
  defaultAgentId,
  onResultClick 
}: SemanticSearchProps) {
  const {
    query,
    agentFilter,
    results,
    searching,
    showIndexPanel,
    stats,
    indexing,
    agents,
    isStale,
    error,
    setQuery,
    setAgentFilter,
    handleSearch,
    triggerIndex,
    handleRetry,
    handleShowIndexPanel,
    setShowIndexPanel
  } = useSemanticSearch(defaultAgentId)

  // Error state with retry option
  if (error && !searching && results.length === 0) {
    return (
      <NetworkErrorState
        error={error}
        onRetry={handleRetry}
        suggestions={[
          'Check your internet connection',
          'Verify OpenClaw Gateway is running',
          'Try a different search query'
        ]}
      />
    )
  }

  return (
    <InlineErrorBoundary name="Semantic Search">
      <div className="space-y-4">
        <SearchErrorBanner isStale={isStale} onRetry={handleRetry} />
        
        <SearchInput
          query={query}
          onQueryChange={setQuery}
          agentFilter={agentFilter}
          onAgentFilterChange={setAgentFilter}
          agents={agents}
          searching={searching}
          onSearch={handleSearch}
          onShowIndexPanel={handleShowIndexPanel}
        />

        {showIndexPanel && (
          <IndexPanel
            stats={stats}
            indexing={indexing}
            agentFilter={agentFilter}
            onClose={() => setShowIndexPanel(false)}
            onTriggerIndex={triggerIndex}
          />
        )}

        {/* Error with existing results */}
        {error && results.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Search completed with errors: {error.message}
          </div>
        )}

        <SearchResults
          results={results}
          query={query}
          onResultClick={onResultClick}
        />
      </div>
    </InlineErrorBoundary>
  )
}