/**
 * Real-time Dashboard Integration
 * Enhances dashboard components with live WebSocket updates
 */

'use client'

import { useEffect, useState } from 'react'
import { 
  MessageSquare, 
  Clock, 
  Activity, 
  TrendingUp,
  Bell,
  Zap
} from 'lucide-react'
import { useRealtimeSessions, useRealtimeCronJobs, useRealtimeDashboard } from '@/hooks/useEnhancedWebSocket'
import { RealtimeStatus, LiveActivityPulse } from './RealtimeStatus'
import { cn } from '@/lib/utils'

interface RealtimeDashboardProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Real-time Dashboard Wrapper
 * Provides live updates for dashboard components
 */
export function RealtimeDashboard({ className, children }: RealtimeDashboardProps) {
  const dashboard = useRealtimeDashboard()
  const [lastActivity, setLastActivity] = useState<Date | null>(null)
  const [activityType, setActivityType] = useState<string>('')

  // Track activity
  useEffect(() => {
    if (dashboard.lastEvent) {
      setLastActivity(new Date())
      setActivityType(dashboard.lastEvent.type)
      
      // Clear activity indicator after 3 seconds
      const timeout = setTimeout(() => {
        setActivityType('')
      }, 3000)
      
      return () => clearTimeout(timeout)
    }
  }, [dashboard.lastEvent])

  return (
    <div className={cn('relative', className)}>
      {/* Real-time Activity Indicator */}
      {activityType && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <LiveActivityPulse size="sm" />
          <span className="text-sm font-medium">
            {activityType.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}

      {/* Connection Status */}
      <div className="fixed bottom-4 right-4 z-40">
        <RealtimeStatus variant="compact" />
      </div>

      {children}
    </div>
  )
}

/**
 * Real-time Sessions List
 * Live updating sessions with WebSocket integration
 */
interface RealtimeSessionsListProps {
  className?: string
  onSessionUpdate?: (sessions: any[]) => void
}

export function RealtimeSessionsList({ className, onSessionUpdate }: RealtimeSessionsListProps) {
  const { sessions, lastUpdate, connected, eventCount } = useRealtimeSessions()
  
  useEffect(() => {
    if (onSessionUpdate && sessions.length > 0) {
      onSessionUpdate(sessions)
    }
  }, [sessions, onSessionUpdate])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with real-time indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Sessions</h3>
          <LiveActivityPulse />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {connected && (
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Live</span>
            </div>
          )}
          
          {lastUpdate && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
          
          {eventCount > 0 && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{eventCount} updates</span>
            </div>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active sessions</p>
            {connected && <p className="text-sm">Listening for new sessions...</p>}
          </div>
        ) : (
          sessions.map((session) => (
            <RealtimeSessionCard key={session.key} session={session} />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Real-time Session Card
 * Individual session with live updates
 */
interface RealtimeSessionCardProps {
  session: any
  className?: string
}

function RealtimeSessionCard({ session, className }: RealtimeSessionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(session.messageCount || 0)

  // Animate when message count changes
  useEffect(() => {
    if (session.messageCount > lastMessageCount) {
      setIsUpdating(true)
      setLastMessageCount(session.messageCount)
      
      const timeout = setTimeout(() => {
        setIsUpdating(false)
      }, 1000)
      
      return () => clearTimeout(timeout)
    }
  }, [session.messageCount, lastMessageCount])

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all duration-200',
      isUpdating && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {session.agentId || 'Unknown Agent'}
            </h4>
            {isUpdating && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Bell className="w-4 h-4 animate-pulse" />
                <span className="text-xs">New message</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Session: {session.key.slice(0, 8)}...</span>
              <span>Kind: {session.kind}</span>
              {session.model && <span>Model: {session.model}</span>}
            </div>
            
            {session.lastActivity && (
              <div>Last activity: {new Date(session.lastActivity).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={cn(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors',
            isUpdating 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          )}>
            <MessageSquare className="w-3 h-3 mr-1" />
            {session.messageCount || 0} messages
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Real-time Cron Jobs List
 * Live updating cron jobs with WebSocket integration
 */
interface RealtimeCronJobsListProps {
  className?: string
  onJobsUpdate?: (jobs: any[]) => void
}

export function RealtimeCronJobsList({ className, onJobsUpdate }: RealtimeCronJobsListProps) {
  const { cronJobs, lastUpdate, lastTriggered, connected, eventCount } = useRealtimeCronJobs()
  
  useEffect(() => {
    if (onJobsUpdate && cronJobs.length > 0) {
      onJobsUpdate(cronJobs)
    }
  }, [cronJobs, onJobsUpdate])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with real-time indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Cron Jobs</h3>
          <LiveActivityPulse />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {connected && (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-green-500" />
              <span>Live</span>
            </div>
          )}
          
          {lastTriggered && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Job {lastTriggered.slice(0, 8)}... triggered</span>
            </div>
          )}
          
          {eventCount > 0 && (
            <span>{eventCount} events</span>
          )}
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {cronJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No cron jobs available</p>
            {connected && <p className="text-sm">Listening for job updates...</p>}
          </div>
        ) : (
          cronJobs.map((job) => (
            <RealtimeCronJobCard 
              key={job.id} 
              job={job} 
              isRecentlyTriggered={lastTriggered === job.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Real-time Cron Job Card
 * Individual cron job with live updates
 */
interface RealtimeCronJobCardProps {
  job: any
  isRecentlyTriggered?: boolean
  className?: string
}

function RealtimeCronJobCard({ job, isRecentlyTriggered, className }: RealtimeCronJobCardProps) {
  const [isTriggering, setIsTriggering] = useState(false)

  useEffect(() => {
    if (isRecentlyTriggered) {
      setIsTriggering(true)
      const timeout = setTimeout(() => {
        setIsTriggering(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isRecentlyTriggered])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
      case 'ok': return 'text-green-600 bg-green-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all duration-200',
      isTriggering && 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {job.name}
            </h4>
            {isTriggering && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="text-xs">Triggered</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>Schedule: {job.schedule}</div>
            <div className="flex items-center space-x-4">
              <span>Next: {job.nextRun}</span>
              {job.lastRun && <span>Last: {job.lastRun}</span>}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={cn(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
            getStatusColor(job.status || 'idle')
          )}>
            {job.status || 'idle'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealtimeDashboard