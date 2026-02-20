/**
 * React hooks for WebSocket integration
 * Provides easy access to real-time Gateway events
 */

import { useEffect, useState, useCallback } from 'react'
import { 
  WebSocketEvent, 
  ConnectionStatus, 
  onWebSocketEvent, 
  onAllWebSocketEvents, 
  getWebSocketStatus, 
  reconnectWebSocket 
} from '../lib/websocket'

/**
 * Hook to get current WebSocket connection status
 * Returns reactive connection state with automatic updates
 */
export function useWebSocketStatus(): ConnectionStatus & { reconnect: () => void } {
  const [status, setStatus] = useState<ConnectionStatus>(getWebSocketStatus())

  useEffect(() => {
    // Update status when connection changes
    const unsubscribe = onWebSocketEvent('agent_status', (event) => {
      if (event.data.status === 'connected' || event.data.status === 'disconnected') {
        setStatus(getWebSocketStatus())
      }
    })

    // Initial status check
    setStatus(getWebSocketStatus())

    // Poll for status updates (fallback in case events are missed)
    const statusInterval = setInterval(() => {
      setStatus(getWebSocketStatus())
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(statusInterval)
    }
  }, [])

  const reconnect = useCallback(() => {
    reconnectWebSocket()
  }, [])

  return {
    ...status,
    reconnect
  }
}

/**
 * Hook to subscribe to specific WebSocket events
 * Automatically manages subscription lifecycle
 */
export function useWebSocketEvent(
  eventType: WebSocketEvent['type'], 
  handler: (event: WebSocketEvent) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = onWebSocketEvent(eventType, handler)
    return unsubscribe
  }, [eventType, ...deps])
}

/**
 * Hook to subscribe to all WebSocket events
 * Useful for debugging or logging
 */
export function useAllWebSocketEvents(
  handler: (event: WebSocketEvent) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = onAllWebSocketEvents(handler)
    return unsubscribe
  }, deps)
}

/**
 * Hook for real-time session updates
 * Triggers re-render when session data changes
 */
export function useSessionUpdates(): {
  lastUpdate: WebSocketEvent | null
  sessionUpdateCount: number
} {
  const [lastUpdate, setLastUpdate] = useState<WebSocketEvent | null>(null)
  const [sessionUpdateCount, setSessionUpdateCount] = useState(0)

  useWebSocketEvent('session_update', (event) => {
    setLastUpdate(event)
    setSessionUpdateCount(count => count + 1)
  })

  useWebSocketEvent('session_created', (event) => {
    setLastUpdate(event)
    setSessionUpdateCount(count => count + 1)
  })

  useWebSocketEvent('session_ended', (event) => {
    setLastUpdate(event)
    setSessionUpdateCount(count => count + 1)
  })

  useWebSocketEvent('message_sent', (event) => {
    setLastUpdate(event)
    setSessionUpdateCount(count => count + 1)
  })

  return {
    lastUpdate,
    sessionUpdateCount
  }
}

/**
 * Hook for real-time message count updates
 * Provides live message counts for sessions
 */
export function useMessageUpdates(): {
  lastMessageUpdate: WebSocketEvent | null
  messageCount: number
} {
  const [lastMessageUpdate, setLastMessageUpdate] = useState<WebSocketEvent | null>(null)
  const [messageCount, setMessageCount] = useState(0)

  useWebSocketEvent('message_sent', (event) => {
    setLastMessageUpdate(event)
    if (event.data.messageCount) {
      setMessageCount(event.data.messageCount)
    }
  })

  return {
    lastMessageUpdate,
    messageCount
  }
}

/**
 * Hook for real-time cron job updates
 * Triggers when cron jobs are executed
 */
export function useCronUpdates(): {
  lastCronUpdate: WebSocketEvent | null
  cronTriggerCount: number
} {
  const [lastCronUpdate, setLastCronUpdate] = useState<WebSocketEvent | null>(null)
  const [cronTriggerCount, setCronTriggerCount] = useState(0)

  useWebSocketEvent('cron_triggered', (event) => {
    setLastCronUpdate(event)
    setCronTriggerCount(count => count + 1)
  })

  return {
    lastCronUpdate,
    cronTriggerCount
  }
}

/**
 * Hook for session-specific updates
 * Only triggers for a specific session key
 */
export function useSessionSpecificUpdates(sessionKey: string): {
  sessionEvents: WebSocketEvent[]
  lastEvent: WebSocketEvent | null
} {
  const [sessionEvents, setSessionEvents] = useState<WebSocketEvent[]>([])
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)

  useAllWebSocketEvents((event) => {
    // Filter events for this specific session
    if (event.data.sessionKey === sessionKey) {
      setSessionEvents(events => [...events.slice(-9), event]) // Keep last 10 events
      setLastEvent(event)
    }
  }, [sessionKey])

  return {
    sessionEvents,
    lastEvent
  }
}

/**
 * Hook for live activity indicators
 * Returns current activity state based on WebSocket events
 */
export function useLiveActivity(): {
  isActive: boolean
  lastActivity: Date | null
  activityType: string | null
} {
  const [isActive, setIsActive] = useState(false)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)
  const [activityType, setActivityType] = useState<string | null>(null)
  const [activityTimeout, setActivityTimeout] = useState<NodeJS.Timeout | null>(null)

  useAllWebSocketEvents((event) => {
    // Any event indicates activity
    setIsActive(true)
    setLastActivity(new Date())
    setActivityType(event.type)

    // Clear previous timeout
    if (activityTimeout) {
      clearTimeout(activityTimeout)
    }

    // Set inactive after 30 seconds of no activity
    const newTimeout = setTimeout(() => {
      setIsActive(false)
      setActivityType(null)
    }, 30000)

    setActivityTimeout(newTimeout)
  })

  useEffect(() => {
    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
    }
  }, [activityTimeout])

  return {
    isActive,
    lastActivity,
    activityType
  }
}

/**
 * Custom hook for triggering re-renders on WebSocket events
 * Useful when you want components to refresh when data changes
 */
export function useWebSocketRefresh(eventTypes: WebSocketEvent['type'][] = ['session_update', 'session_created', 'session_ended']): number {
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    const unsubscribers = eventTypes.map(eventType => 
      onWebSocketEvent(eventType, () => {
        setRefreshCount(count => count + 1)
      })
    )

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [eventTypes.join(',')])

  return refreshCount
}