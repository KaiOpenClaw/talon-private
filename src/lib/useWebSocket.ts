/**
 * useWebSocket Hook
 * Manages WebSocket connections for real-time updates
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { logger } from '@/lib/logger'

interface TalonWebSocketMessage {
  type: 'sessions' | 'agents' | 'cron' | 'chat' | 'status' | 'error'
  data?: unknown
  timestamp: number
}

interface WebSocketOptions {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onMessage?: (message: TalonWebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export interface WebSocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  lastMessage: TalonWebSocketMessage | null
  reconnectAttempt: number
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    url = '/api/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
    reconnectAttempt: 0
  })

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    setState(prev => ({ ...prev, connecting: true, error: null }))

    try {
      // Convert HTTP URL to WebSocket URL
      const wsUrl = url.startsWith('ws') 
        ? url 
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`

      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        logger.info('WebSocket connected', {
          component: 'useWebSocket',
          action: 'connect',
          url
        })
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempt: 0
        }))
        onConnect?.()
      }

      ws.current.onmessage = (event) => {
        try {
          const message: TalonWebSocketMessage = JSON.parse(event.data)
          setState(prev => ({ ...prev, lastMessage: message }))
          onMessage?.(message)
        } catch (error) {
          logger.error('WebSocket message parse error', {
            component: 'useWebSocket',
            action: 'parseMessage',
            error: error instanceof Error ? error.message : String(error),
            rawData: event.data
          })
        }
      }

      ws.current.onclose = () => {
        logger.info('WebSocket disconnected', {
          component: 'useWebSocket',
          action: 'disconnect',
          url
        })
        setState(prev => ({ ...prev, connected: false, connecting: false }))
        onDisconnect?.()

        // Auto-reconnect if under max attempts
        if (state.reconnectAttempt < maxReconnectAttempts) {
          reconnectTimer.current = setTimeout(() => {
            setState(prev => ({ 
              ...prev, 
              reconnectAttempt: prev.reconnectAttempt + 1 
            }))
            connect()
          }, reconnectInterval)
        }
      }

      ws.current.onerror = (error) => {
        logger.error('WebSocket error', {
          component: 'useWebSocket',
          action: 'error',
          error: String(error),
          url
        })
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error', 
          connecting: false 
        }))
        onError?.(error)
      }

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection', 
        connecting: false 
      }))
    }
  }, [url, maxReconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError, state.reconnectAttempt])

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    setState(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false, 
      reconnectAttempt: 0 
    }))
  }, [])

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    isConnected: state.connected,
    isConnecting: state.connecting
  }
}

// Hook for specific data subscriptions
export function useRealtimeData<T>(
  dataType: 'sessions' | 'agents' | 'cron' | 'chat',
  initialData?: T
) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const webSocket = useWebSocket({
    onMessage: (message) => {
      if (message.type === dataType) {
        setData(message.data as T)
        setLastUpdate(message.timestamp)
      }
    }
  })

  const refreshData = useCallback(() => {
    webSocket.sendMessage({
      type: 'refresh',
      dataType,
      timestamp: Date.now()
    })
  }, [webSocket, dataType])

  return {
    data,
    lastUpdate,
    refreshData,
    ...webSocket
  }
}