/**
 * Real-time Event Broadcasting System
 * Centralized system for triggering WebSocket events across the application
 */

import { logger } from './logger'

export type RealtimeEventType = 
  | 'session_update' 
  | 'session_created' 
  | 'session_ended' 
  | 'message_sent'
  | 'cron_triggered' 
  | 'cron_updated'
  | 'agent_status_change'
  | 'system_health_update'
  | 'dashboard_refresh'
  | 'user_activity'

export interface RealtimeEvent {
  type: RealtimeEventType
  data: Record<string, any>
  timestamp: string
  source?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

class RealtimeEventManager {
  private static instance: RealtimeEventManager
  private eventQueue: RealtimeEvent[] = []
  private subscribers: Map<RealtimeEventType | 'all', Array<(event: RealtimeEvent) => void>> = new Map()
  private broadcastUrl: string

  constructor() {
    this.broadcastUrl = '/api/ws?action=broadcast'
  }

  static getInstance(): RealtimeEventManager {
    if (!RealtimeEventManager.instance) {
      RealtimeEventManager.instance = new RealtimeEventManager()
    }
    return RealtimeEventManager.instance
  }

  /**
   * Broadcast an event to all connected WebSocket clients
   */
  async broadcastEvent(event: Omit<RealtimeEvent, 'timestamp'>): Promise<boolean> {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    try {
      // Add to local queue
      this.eventQueue.push(fullEvent)
      this.trimQueue()

      // Notify local subscribers
      this.notifySubscribers(fullEvent)

      // Broadcast via WebSocket API
      if (typeof window !== 'undefined') {
        const response = await fetch(this.broadcastUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'broadcast',
            data: {
              type: fullEvent.type,
              payload: fullEvent.data,
              priority: fullEvent.priority || 'medium'
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Broadcast failed: ${response.statusText}`)
        }
      }

      logger.debug('Real-time event broadcasted', {
        eventType: fullEvent.type,
        source: fullEvent.source,
        priority: fullEvent.priority,
        dataKeys: Object.keys(fullEvent.data),
        component: 'RealtimeEventManager'
      })

      return true
    } catch (error) {
      logger.error('Failed to broadcast real-time event', {
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
        component: 'RealtimeEventManager'
      })
      return false
    }
  }

  /**
   * Subscribe to specific event types or all events
   */
  subscribe(
    eventType: RealtimeEventType | 'all', 
    callback: (event: RealtimeEvent) => void
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }

    this.subscribers.get(eventType)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Get recent events from the queue
   */
  getRecentEvents(count: number = 10, eventType?: RealtimeEventType): RealtimeEvent[] {
    let events = this.eventQueue

    if (eventType) {
      events = events.filter(e => e.type === eventType)
    }

    return events
      .slice(-count)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Clear the event queue
   */
  clearQueue(): void {
    this.eventQueue = []
  }

  /**
   * Notify local subscribers
   */
  private notifySubscribers(event: RealtimeEvent): void {
    // Notify specific event type subscribers
    const typeSubscribers = this.subscribers.get(event.type) || []
    typeSubscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        logger.error('Error in real-time event subscriber', {
          eventType: event.type,
          error: error instanceof Error ? error.message : String(error),
          component: 'RealtimeEventManager'
        })
      }
    })

    // Notify 'all' event subscribers
    const allSubscribers = this.subscribers.get('all') || []
    allSubscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        logger.error('Error in real-time event all subscriber', {
          eventType: event.type,
          error: error instanceof Error ? error.message : String(error),
          component: 'RealtimeEventManager'
        })
      }
    })
  }

  /**
   * Trim event queue to prevent memory leaks
   */
  private trimQueue(): void {
    const maxEvents = 100
    if (this.eventQueue.length > maxEvents) {
      this.eventQueue = this.eventQueue.slice(-maxEvents)
    }
  }
}

// Singleton instance
export const realtimeEvents = RealtimeEventManager.getInstance()

// Convenience functions for common events

export async function broadcastSessionUpdate(sessionData: any): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'session_update',
    data: { session: sessionData },
    source: 'session_api',
    priority: 'medium'
  })
}

export async function broadcastNewSession(sessionData: any): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'session_created',
    data: { session: sessionData },
    source: 'session_api',
    priority: 'high'
  })
}

export async function broadcastSessionEnded(sessionKey: string): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'session_ended',
    data: { sessionKey },
    source: 'session_api',
    priority: 'medium'
  })
}

export async function broadcastNewMessage(sessionKey: string, messageCount: number): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'message_sent',
    data: { sessionKey, messageCount },
    source: 'chat_api',
    priority: 'high'
  })
}

export async function broadcastCronJobTriggered(jobId: string, jobName?: string): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'cron_triggered',
    data: { cronJobId: jobId, jobName },
    source: 'cron_api',
    priority: 'medium'
  })
}

export async function broadcastAgentStatusChange(agentId: string, status: string): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'agent_status_change',
    data: { agentId, status },
    source: 'agent_api',
    priority: 'low'
  })
}

export async function broadcastSystemHealthUpdate(healthData: any): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'system_health_update',
    data: healthData,
    source: 'system_monitor',
    priority: 'low'
  })
}

export async function broadcastDashboardRefresh(): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'dashboard_refresh',
    data: { timestamp: new Date().toISOString() },
    source: 'dashboard',
    priority: 'low'
  })
}

export async function broadcastUserActivity(activity: string, metadata?: any): Promise<boolean> {
  return realtimeEvents.broadcastEvent({
    type: 'user_activity',
    data: { activity, metadata },
    source: 'user_interface',
    priority: 'low'
  })
}

export default realtimeEvents