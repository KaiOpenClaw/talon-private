/**
 * Custom hook for semantic search logic and state management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSafeApiCall, useComponentError } from '@/hooks/useSafeApiCall'
import type { SearchResult, IndexStats } from './types'

export function useSemanticSearch(defaultAgentId?: string) {
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

  const handleShowIndexPanel = useCallback(() => {
    setShowIndexPanel(!showIndexPanel)
    if (!stats) fetchStats()
  }, [showIndexPanel, stats, fetchStats])

  return {
    // State
    query,
    agentFilter,
    results,
    searching,
    showIndexPanel,
    stats,
    indexing,
    agents,
    isStale,
    retryCount,
    error,
    
    // Actions
    setQuery,
    setAgentFilter,
    handleSearch,
    triggerIndex,
    handleRetry,
    handleShowIndexPanel,
    setShowIndexPanel,
    clearError
  }
}