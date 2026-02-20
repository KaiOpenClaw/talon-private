'use client'

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'
import { useSafeApiCall } from '@/hooks/useSafeApiCall'
import { useSessionUpdates, useWebSocketStatus } from '@/hooks/useWebSocket'

interface Session {
  key: string
  kind: string
  agentId?: string
  model?: string
  channel?: string
  lastActivity?: string
  messageCount?: number
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export function useSessionsData() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const safeApiCall = useSafeApiCall()
  
  // WebSocket integration for real-time updates
  const { lastUpdate, sessionUpdateCount } = useSessionUpdates()
  const { connected: wsConnected } = useWebSocketStatus()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await safeApiCall(
      async () => {
        logger.debug('Fetching active sessions', { 
          activeMinutes: 60, 
          messageLimit: 3,
          retryCount 
        })
        
        const res = await fetch('/api/sessions/list?activeMinutes=60&messageLimit=3')
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        return data.sessions || []
      },
      {
        component: 'SessionsList',
        action: 'fetchSessions',
        fallbackData: [],
        errorMessage: 'Failed to load sessions',
        showToast: retryCount > 0 // Only show toast after first failure
      }
    )

    if (result.isSuccess && result.data) {
      setSessions(result.data)
      setError(null)
      setRetryCount(0)
      
      logger.info('Sessions loaded successfully', {
        component: 'SessionsList',
        action: 'fetchSessions',
        count: result.data.length
      })
    } else if (result.error) {
      setError(result.error.message)
      setRetryCount(prev => prev + 1)
      setSessions([]) // Clear stale data
    }
    
    setLoading(false)
  }, [safeApiCall, retryCount])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Refresh sessions when WebSocket updates are received
  useEffect(() => {
    if (lastUpdate && sessionUpdateCount > 0) {
      logger.debug('WebSocket session update received', { 
        component: 'SessionsList',
        lastUpdate,
        updateCount: sessionUpdateCount 
      })
      
      // Debounce rapid updates
      const timeoutId = setTimeout(() => {
        fetchSessions()
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [lastUpdate, sessionUpdateCount, fetchSessions])

  return {
    sessions,
    loading,
    error,
    wsConnected,
    refetchSessions: fetchSessions
  }
}