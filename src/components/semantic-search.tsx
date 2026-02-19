'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSafeApiCall, useComponentError } from '@/hooks/useSafeApiCall'
import { InlineErrorBoundary } from '@/components/error-boundary'
import { ErrorState, NetworkErrorState } from '@/components/error-state'
import { VoiceSearchInput } from '@/components/mobile/voice-search'
import { useDeviceOptimizations } from '@/components/mobile/mobile-optimized-layout'
import { 
  Search, Loader2, FileText, FolderOpen, 
  Brain, Users, ChevronRight, X,
  Database, RefreshCw, AlertCircle
} from 'lucide-react'

interface SearchResult {
  document: {
    id: string
    content: string
    agentId: string
    filePath: string
    fileType: string
    chunk: number
    timestamp: string
  }
  score: number
  snippet: string
}

interface IndexStats {
  status: string
  totalDocuments: number
  byAgent: Record<string, number>
  lastIndexed?: string
}

interface SemanticSearchProps {
  defaultAgentId?: string
  onResultClick?: (result: SearchResult) => void
}

const FILE_TYPE_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  memory: { icon: Brain, color: 'text-purple-400' },
  soul: { icon: Users, color: 'text-blue-400' },
  tools: { icon: FileText, color: 'text-green-400' },
  agents: { icon: FolderOpen, color: 'text-orange-400' },
  docs: { icon: FileText, color: 'text-cyan-400' },
  other: { icon: FileText, color: 'text-ink-muted' },
}

export default function SemanticSearch({ 
  defaultAgentId,
  onResultClick 
}: SemanticSearchProps) {
  const [query, setQuery] = useState('')
  const [agentFilter, setAgentFilter] = useState(defaultAgentId || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showIndexPanel, setShowIndexPanel] = useState(false)
  const [stats, setStats] = useState<IndexStats | null>(null)
  const [indexing, setIndexing] = useState(false)
  const [agents, setAgents] = useState<string[]>([])
  const [isStale, setIsStale] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  const safeApiCall = useSafeApiCall()
  const { error, handleError, clearError } = useComponentError('SemanticSearch')
  const device = useDeviceOptimizations()

  // Fetch agent list on mount with error handling
  useEffect(() => {
    const fetchAgents = async () => {
      const result = await safeApiCall(
        () => fetch('/api/agents').then(res => res.json()),
        {
          component: 'SemanticSearch',
          errorMessage: 'Failed to load agent list',
          showToast: false // Don't show toast for background loading
        }
      )

      if (result.isSuccess && result.data?.agents) {
        setAgents(result.data.agents.map((a: { id: string }) => a.id))
      }
    }

    fetchAgents()
  }, [safeApiCall])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    
    setSearching(true)
    clearError()
    
    const params = new URLSearchParams({
      q: query.trim(),
      limit: '20',
    })
    if (agentFilter) params.set('agent', agentFilter)
    
    const result = await safeApiCall(
      () => fetch(`/api/search?${params}`).then(res => res.json()),
      {
        component: 'SemanticSearch',
        errorMessage: `Search failed for "${query.trim()}"`
      }
    )

    if (result.isSuccess && result.data) {
      setResults(result.data.results || [])
      setIsStale(false)
      setRetryCount(0)
    } else if (result.error) {
      handleError(result.error, false) // Don't show toast, already handled by safeApiCall
      setIsStale(true)
    }
    
    setSearching(false)
  }, [query, agentFilter, safeApiCall, clearError, handleError])

  const fetchStats = useCallback(async () => {
    const result = await safeApiCall(
      () => fetch('/api/index').then(res => res.json()),
      {
        component: 'SemanticSearch',
        errorMessage: 'Failed to load index statistics',
        showToast: false // Don't show toast for background stats loading
      }
    )

    if (result.isSuccess && result.data) {
      setStats(result.data)
    }
  }, [safeApiCall])

  const triggerIndex = useCallback(async (agentId?: string) => {
    setIndexing(true)
    clearError()

    const result = await safeApiCall(
      () => fetch('/api/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      }).then(res => res.json()),
      {
        component: 'SemanticSearch',
        errorMessage: agentId 
          ? `Failed to index agent: ${agentId}`
          : 'Failed to index all agents'
      }
    )

    if (result.isSuccess) {
      await fetchStats() // Refresh stats after successful indexing
    } else if (result.error) {
      handleError(result.error, false) // Don't show toast, already handled by safeApiCall
    }
    
    setIndexing(false)
  }, [safeApiCall, clearError, handleError, fetchStats])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    if (query.trim()) {
      handleSearch()
    }
  }, [query, handleSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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
        {/* Connection Status Banner */}
        {isStale && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Search may be using cached data - connection issues detected
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors"
            >
              <RefreshCw className="h-3 w-3 mr-1 inline" />
              Retry
            </button>
          </div>
        )}
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted z-10 pointer-events-none" />
          <VoiceSearchInput
            value={query}
            onChange={setQuery}
            onVoiceComplete={(transcript) => {
              setQuery(transcript)
              // Auto-search when voice input is complete
              setTimeout(handleSearch, 100)
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
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-4 py-3 bg-surface-2 border border-border-default rounded-lg text-sm focus:outline-none focus:border-terminal-500/50 min-w-[140px]"
        >
          <option value="">All Agents</option>
          {agents.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
        
        <button
          onClick={handleSearch}
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
          onClick={() => {
            setShowIndexPanel(!showIndexPanel)
            if (!stats) fetchStats()
          }}
          className="p-3 bg-surface-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary"
          title="Index Management"
        >
          <Database className="w-4 h-4" />
        </button>
      </div>

      {/* Index Management Panel */}
      {showIndexPanel && (
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              Vector Index
            </h3>
            <button onClick={() => setShowIndexPanel(false)} className="p-1 hover:bg-surface-3 rounded">
              <X className="w-4 h-4 text-ink-muted" />
            </button>
          </div>
          
          {stats ? (
            <div className="space-y-4">
              {stats.status === 'unavailable' ? (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  LanceDB not available (running on Vercel?)
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-surface-2 rounded-lg px-4 py-2 text-center">
                      <div className="text-xl font-bold text-terminal-400">{stats.totalDocuments}</div>
                      <div className="text-xs text-ink-muted">Total Chunks</div>
                    </div>
                    <div className="bg-surface-2 rounded-lg px-4 py-2 text-center">
                      <div className="text-xl font-bold text-blue-400">{Object.keys(stats.byAgent || {}).length}</div>
                      <div className="text-xs text-ink-muted">Agents Indexed</div>
                    </div>
                  </div>
                  
                  {stats.byAgent && Object.keys(stats.byAgent).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stats.byAgent).map(([agent, count]) => (
                        <span 
                          key={agent} 
                          className="px-2 py-1 bg-surface-2 rounded text-xs text-ink-secondary"
                        >
                          {agent}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerIndex()}
                      disabled={indexing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm font-medium"
                    >
                      {indexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Reindex All
                    </button>
                    {agentFilter && (
                      <button
                        onClick={() => triggerIndex(agentFilter)}
                        disabled={indexing}
                        className="px-4 py-2 bg-surface-3 hover:bg-surface-4 rounded-lg text-sm"
                      >
                        Index {agentFilter}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-terminal-500" />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && results.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Search completed with errors: {error.message}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-ink-muted">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </div>
          
          {results.map((result, i) => {
            const typeConfig = FILE_TYPE_ICONS[result.document.fileType] || FILE_TYPE_ICONS.other
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
      )}

      {/* Empty state */}
      {!searching && results.length === 0 && query && !error && (
        <div className="text-center py-8 text-ink-muted">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No results found for &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Try different keywords or index more workspaces</p>
        </div>
      )}

      {/* Initial state */}
      {!searching && results.length === 0 && !query && !error && (
        <div className="text-center py-8 text-ink-muted">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Search across agent memories, souls, and tools</p>
          <p className="text-xs mt-1">Uses semantic embeddings for intelligent matching</p>
        </div>
      )}
      </div>
    </InlineErrorBoundary>
  )
}
