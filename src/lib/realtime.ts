'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { logger } from './logger'

/**
 * Get WebSocket URL dynamically without exposing sensitive configuration
 * This function constructs the WebSocket URL based on the current window location
 */
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return 'ws://localhost:6820/ws'
  }
  
  // In development, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:6820/ws'
  }
  
  // In production, construct WebSocket URL from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  
  // Use the same host but WebSocket protocol
  // In a real deployment, you might want to use a different WebSocket endpoint
  return `${protocol}//${host}/api/ws`
}

interface RealtimeMessage {
  type: 'session_update' | 'agent_status' | 'spawn_result' | 'message' | 'error'
  sessionKey?: string
  agentId?: string
  data?: unknown
  timestamp: string
}

interface UseRealtimeOptions {
  onMessage?: (msg: RealtimeMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
  reconnectInterval?: number
}

/**
 * Real-time WebSocket connection to OpenClaw gateway
 */
export function useRealtime(options: UseRealtimeOptions = {}) {
  const { 
    onMessage, 
    onConnect, 
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 5000
  } = options
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      const ws = new WebSocket(getWebSocketUrl())
      
      ws.onopen = () => {
        setConnected(true)
        onConnect?.()
        
        // Subscribe to all events
        ws.send(JSON.stringify({ type: 'subscribe', topics: ['sessions', 'agents', 'spawns'] }))
      }
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as RealtimeMessage
          setLastMessage(msg)
          onMessage?.(msg)
        } catch (e) {
          logger.error('Failed to parse WebSocket message', {
            component: 'useRealtime',
            error: e instanceof Error ? e.message : String(e),
            rawData: event.data
          })
        }
      }
      
      ws.onclose = () => {
        setConnected(false)
        onDisconnect?.()
        
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval)
        }
      }
      
      ws.onerror = (error) => {
        logger.error('WebSocket connection error', {
          component: 'useRealtime',
          url: getWebSocketUrl(),
          error: error.toString()
        })
      }
      
      wsRef.current = ws
    } catch (e) {
      logger.error('Failed to establish WebSocket connection', {
        component: 'useRealtime',
        url: getWebSocketUrl(),
        error: e instanceof Error ? e.message : String(e),
        willReconnect: autoReconnect,
        reconnectInterval
      })
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval)
      }
    }
  }, [onMessage, onConnect, onDisconnect, autoReconnect, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { connected, lastMessage, send, reconnect: connect }
}

/**
 * Polling fallback for environments without WebSocket
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval = 5000,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (!enabled) return
    
    fetch()
    const timer = setInterval(fetch, interval)
    return () => clearInterval(timer)
  }, [fetch, interval, enabled])

  return { data, loading, error, refetch: fetch }
}

/**
 * Hook for tracking spawned sessions
 */
export function useSpawnedSessions() {
  const [sessions, setSessions] = useState<Array<{
    sessionKey: string
    task: string
    agentId?: string
    status: 'running' | 'completed' | 'error'
    result?: string
    startedAt: string
    completedAt?: string
  }>>([])

  const spawn = useCallback(async (params: {
    task: string
    agentId?: string
    label?: string
    model?: string
  }) => {
    const startedAt = new Date().toISOString()
    const tempKey = `spawn-${Date.now()}`
    
    // Add optimistic entry
    setSessions(prev => [...prev, {
      sessionKey: tempKey,
      task: params.task,
      agentId: params.agentId,
      status: 'running',
      startedAt,
    }])
    
    try {
      const res = await fetch('/api/sessions/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setSessions(prev => prev.map(s => 
          s.sessionKey === tempKey 
            ? { ...s, status: 'error' as const, result: data.error }
            : s
        ))
        return { error: data.error }
      }
      
      setSessions(prev => prev.map(s =>
        s.sessionKey === tempKey
          ? { ...s, sessionKey: data.sessionKey || tempKey, status: 'completed' as const, result: data.response, completedAt: new Date().toISOString() }
          : s
      ))
      
      return data
    } catch (e) {
      setSessions(prev => prev.map(s =>
        s.sessionKey === tempKey
          ? { ...s, status: 'error' as const, result: (e as Error).message }
          : s
      ))
      return { error: (e as Error).message }
    }
  }, [])

  const clear = useCallback(() => setSessions([]), [])
  
  return { sessions, spawn, clear }
}
