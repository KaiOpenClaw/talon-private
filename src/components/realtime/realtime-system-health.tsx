'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Zap, 
  Database, 
  Server, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare
} from 'lucide-react'
import { useRealtimeDashboard, useRealtimeSessions, useRealtimeCronJobs } from '@/hooks/useEnhancedWebSocket'
import { cn } from '@/lib/utils'

interface SystemHealthMetrics {
  webSocket: {
    status: 'connected' | 'disconnected' | 'reconnecting'
    clients: number
    events: number
    uptime: number
  }
  sessions: {
    total: number
    active: number
    trend: 'up' | 'down' | 'stable'
    lastUpdate: Date | null
  }
  cronJobs: {
    total: number
    running: number
    errors: number
    lastTriggered: string | null
  }
  gateway: {
    status: 'online' | 'offline' | 'error'
    responseTime: number
    lastCheck: Date | null
  }
}

interface RealtimeSystemHealthProps {
  className?: string
  variant?: 'compact' | 'detailed' | 'minimal'
  showTrends?: boolean
}

export function RealtimeSystemHealth({
  className,
  variant = 'detailed',
  showTrends = true
}: RealtimeSystemHealthProps) {
  const realtimeDashboard = useRealtimeDashboard()
  const realtimeSessions = useRealtimeSessions()
  const realtimeCronJobs = useRealtimeCronJobs()
  
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    webSocket: {
      status: 'disconnected',
      clients: 0,
      events: 0,
      uptime: 0
    },
    sessions: {
      total: 0,
      active: 0,
      trend: 'stable',
      lastUpdate: null
    },
    cronJobs: {
      total: 0,
      running: 0,
      errors: 0,
      lastTriggered: null
    },
    gateway: {
      status: 'offline',
      responseTime: 0,
      lastCheck: null
    }
  })

  const [previousSessionCount, setPreviousSessionCount] = useState(0)
  const [healthScore, setHealthScore] = useState(0)

  // Update WebSocket metrics
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      webSocket: {
        status: realtimeDashboard.reconnecting ? 'reconnecting' : 
                realtimeDashboard.connected ? 'connected' : 'disconnected',
        clients: realtimeDashboard.activeClients,
        events: realtimeDashboard.eventCount,
        uptime: realtimeDashboard.connectionTime ? 
               Date.now() - realtimeDashboard.connectionTime.getTime() : 0
      }
    }))
  }, [realtimeDashboard])

  // Update session metrics
  useEffect(() => {
    if (realtimeSessions.sessions.length > 0 || realtimeSessions.lastUpdate) {
      const activeSessions = realtimeSessions.sessions.filter(s => 
        s.lastActivity && 
        new Date(s.lastActivity) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      ).length

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (realtimeSessions.sessions.length > previousSessionCount) trend = 'up'
      else if (realtimeSessions.sessions.length < previousSessionCount) trend = 'down'
      
      setPreviousSessionCount(realtimeSessions.sessions.length)

      setMetrics(prev => ({
        ...prev,
        sessions: {
          total: realtimeSessions.sessions.length,
          active: activeSessions,
          trend,
          lastUpdate: realtimeSessions.lastUpdate
        }
      }))
    }
  }, [realtimeSessions, previousSessionCount])

  // Update cron job metrics
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      cronJobs: {
        total: realtimeCronJobs.cronJobs.length,
        running: realtimeCronJobs.cronJobs.filter(j => j.status === 'running').length,
        errors: realtimeCronJobs.cronJobs.filter(j => j.status === 'error').length,
        lastTriggered: realtimeCronJobs.lastTriggered
      }
    }))
  }, [realtimeCronJobs])

  // Calculate overall health score
  useEffect(() => {
    let score = 0
    
    // WebSocket health (40%)
    if (metrics.webSocket.status === 'connected') score += 40
    else if (metrics.webSocket.status === 'reconnecting') score += 20
    
    // Session health (30%)
    if (metrics.sessions.total > 0) score += 20
    if (metrics.sessions.active > 0) score += 10
    
    // Cron job health (20%)
    if (metrics.cronJobs.total > 0 && metrics.cronJobs.errors === 0) score += 20
    else if (metrics.cronJobs.errors === 0) score += 10
    
    // Gateway health (10%)
    if (metrics.gateway.status === 'online') score += 10
    
    setHealthScore(score)
  }, [metrics])

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />
      default: return <Activity className="w-3 h-3 text-gray-500" />
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center space-x-2', className)}>
        <div className={cn('flex items-center space-x-1', getHealthColor(healthScore))}>
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium">{healthScore}%</span>
        </div>
        {metrics.webSocket.status === 'connected' && (
          <Wifi className="w-4 h-4 text-green-500" />
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border p-3', className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">System Health</h3>
          <div className={cn('text-lg font-bold', getHealthColor(healthScore))}>
            {healthScore}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon(metrics.webSocket.status)}
            <span className="text-sm text-gray-600">WebSocket</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">{metrics.sessions.active} Active</span>
            {showTrends && getTrendIcon(metrics.sessions.trend)}
          </div>
        </div>

        {metrics.webSocket.status === 'connected' && (
          <div className="mt-2 text-xs text-gray-500">
            {metrics.webSocket.clients} clients • {metrics.webSocket.events} events
          </div>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4', className)}>
      {/* Header with overall health */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          System Health Monitor
        </h3>
        <div className={cn('text-2xl font-bold', getHealthColor(healthScore))}>
          {healthScore}%
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* WebSocket Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">WebSocket</span>
            </div>
            {getStatusIcon(metrics.webSocket.status)}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={cn(
                'font-medium',
                metrics.webSocket.status === 'connected' ? 'text-green-600' :
                metrics.webSocket.status === 'reconnecting' ? 'text-yellow-600' : 'text-red-600'
              )}>
                {metrics.webSocket.status.charAt(0).toUpperCase() + metrics.webSocket.status.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Clients</span>
              <span className="text-gray-900 dark:text-gray-100">
                {metrics.webSocket.clients}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Events</span>
              <span className="text-gray-900 dark:text-gray-100">
                {metrics.webSocket.events}
              </span>
            </div>

            {metrics.webSocket.uptime > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {Math.round(metrics.webSocket.uptime / 1000)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Sessions</span>
            </div>
            <div className="flex items-center space-x-1">
              {showTrends && getTrendIcon(metrics.sessions.trend)}
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-gray-900 dark:text-gray-100">
                {metrics.sessions.total}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="text-blue-600 font-medium">
                {metrics.sessions.active}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Trend</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metrics.sessions.trend)}
                <span className="text-gray-900 dark:text-gray-100 text-xs">
                  {metrics.sessions.trend}
                </span>
              </div>
            </div>

            {metrics.sessions.lastUpdate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {metrics.sessions.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cron Jobs Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Cron Jobs</span>
            </div>
            {getStatusIcon(metrics.cronJobs.errors > 0 ? 'error' : 'online')}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-gray-900 dark:text-gray-100">
                {metrics.cronJobs.total}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Running</span>
              <span className="text-blue-600 font-medium">
                {metrics.cronJobs.running}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Errors</span>
              <span className={cn(
                'font-medium',
                metrics.cronJobs.errors > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
              )}>
                {metrics.cronJobs.errors}
              </span>
            </div>

            {metrics.cronJobs.lastTriggered && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Job</span>
                <span className="text-gray-900 dark:text-gray-100 text-xs font-mono">
                  {metrics.cronJobs.lastTriggered.slice(0, 8)}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gateway Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Gateway</span>
            </div>
            {getStatusIcon(metrics.gateway.status)}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={cn(
                'font-medium',
                metrics.gateway.status === 'online' ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics.gateway.status.charAt(0).toUpperCase() + metrics.gateway.status.slice(1)}
              </span>
            </div>
            
            {metrics.gateway.responseTime > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Response</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {metrics.gateway.responseTime}ms
                </span>
              </div>
            )}

            {metrics.gateway.lastCheck && (
              <div className="flex justify-between">
                <span className="text-gray-600">Checked</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {metrics.gateway.lastCheck.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      {(realtimeDashboard.lastEvent || metrics.sessions.lastUpdate || metrics.cronJobs.lastTriggered) && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Activity</h4>
          
          <div className="space-y-2 text-sm">
            {realtimeDashboard.lastEvent && (
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">WebSocket event:</span>
                <span className="font-mono text-blue-600">
                  {realtimeDashboard.lastEvent.type}
                </span>
                <span className="text-gray-500 ml-auto">
                  {new Date(realtimeDashboard.lastEvent.data.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}

            {metrics.sessions.lastUpdate && (
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-3 h-3 text-green-500" />
                <span className="text-gray-600">Sessions updated</span>
                <span className="text-gray-500 ml-auto">
                  {metrics.sessions.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}

            {metrics.cronJobs.lastTriggered && (
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-gray-600">Cron job triggered:</span>
                <span className="font-mono text-orange-600">
                  {metrics.cronJobs.lastTriggered.slice(0, 8)}...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RealtimeSystemHealth