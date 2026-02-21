'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, AlertTriangle, Zap, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useRealtimeDashboard, useRealtimeSessions, useRealtimeCronJobs } from '@/hooks/useEnhancedWebSocket'
import { cn } from '@/lib/utils'

interface RealtimeDashboardStatsProps {
  agentCount: number
  activeSessionCount: number
  totalSessions: number
  blockersCount: number
  className?: string
}

export function RealtimeDashboardStats({ 
  agentCount, 
  activeSessionCount, 
  totalSessions, 
  blockersCount,
  className 
}: RealtimeDashboardStatsProps) {
  const realtimeDashboard = useRealtimeDashboard()
  const realtimeSessions = useRealtimeSessions()
  const realtimeCronJobs = useRealtimeCronJobs()
  
  // Real-time stats state
  const [liveStats, setLiveStats] = useState({
    agentCount,
    activeSessionCount,
    totalSessions,
    blockersCount,
    recentActivity: 0,
    wsConnected: false,
    lastUpdate: null as Date | null
  })

  const [activityPulse, setActivityPulse] = useState(false)

  // Update stats from WebSocket events
  useEffect(() => {
    if (realtimeSessions.sessions.length > 0) {
      const activeSessions = realtimeSessions.sessions.filter(s => 
        s.lastActivity && 
        new Date(s.lastActivity) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      ).length
      
      setLiveStats(prev => ({
        ...prev,
        totalSessions: realtimeSessions.sessions.length,
        activeSessionCount: activeSessions,
        lastUpdate: new Date()
      }))
    }
  }, [realtimeSessions.sessions])

  // Update connection status
  useEffect(() => {
    setLiveStats(prev => ({
      ...prev,
      wsConnected: realtimeDashboard.connected
    }))
  }, [realtimeDashboard.connected])

  // Trigger activity pulse on events
  useEffect(() => {
    if (realtimeDashboard.lastEvent || realtimeSessions.lastUpdate || realtimeCronJobs.lastUpdate) {
      setActivityPulse(true)
      setLiveStats(prev => ({ ...prev, recentActivity: prev.recentActivity + 1 }))
      
      const timeout = setTimeout(() => setActivityPulse(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [realtimeDashboard.lastEvent, realtimeSessions.lastUpdate, realtimeCronJobs.lastUpdate])

  const getConnectionStatus = () => {
    if (realtimeDashboard.reconnecting) return { icon: RefreshCw, color: 'text-yellow-400', label: 'Reconnecting', animate: 'animate-spin' }
    if (liveStats.wsConnected) return { icon: Wifi, color: 'text-green-400', label: 'Connected', animate: '' }
    return { icon: WifiOff, color: 'text-red-400', label: 'Disconnected', animate: '' }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className={cn('p-4 border-b border-border-subtle', className)}>
      {/* Real-time Connection Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <connectionStatus.icon className={cn('w-4 h-4', connectionStatus.color, connectionStatus.animate)} />
          <span className="text-sm font-medium text-ink-base">
            {connectionStatus.label}
          </span>
        </div>
        
        {liveStats.wsConnected && realtimeDashboard.activeClients > 0 && (
          <div className="text-xs text-ink-muted">
            {realtimeDashboard.activeClients} clients
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-surface-2 rounded-lg p-3 relative overflow-hidden">
          <div className={cn(
            'text-xl font-bold text-terminal-400 transition-colors',
            activityPulse && 'text-terminal-300'
          )}>
            {liveStats.agentCount}
          </div>
          <div className="text-xs text-ink-muted mt-1">Agents</div>
          {activityPulse && (
            <div className="absolute inset-0 bg-terminal-400/10 animate-pulse rounded-lg" />
          )}
        </div>
        
        <div className="bg-surface-2 rounded-lg p-3 relative overflow-hidden">
          <div className={cn(
            'text-xl font-bold text-blue-400 transition-colors',
            activityPulse && 'text-blue-300'
          )}>
            {liveStats.activeSessionCount}
          </div>
          <div className="text-xs text-ink-muted mt-1">Active Sessions</div>
          {realtimeSessions.sessions.length > liveStats.activeSessionCount && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          )}
        </div>
      </div>
      
      {/* Secondary Stats Grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="bg-surface-2 rounded-lg p-3 relative">
          <Activity className="w-4 h-4 text-green-400 absolute top-2 right-2" />
          <div className={cn(
            'text-xl font-bold text-green-400 transition-colors',
            realtimeSessions.lastUpdate && 'animate-pulse'
          )}>
            {liveStats.totalSessions}
          </div>
          <div className="text-xs text-ink-muted mt-1">Total Sessions</div>
          
          {realtimeSessions.lastUpdate && (
            <div className="text-xs text-green-600 mt-1">
              Updated {realtimeSessions.lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="bg-surface-2 rounded-lg p-3 relative">
          <AlertTriangle className={cn(
            'w-4 h-4 absolute top-2 right-2',
            liveStats.blockersCount > 0 ? 'text-red-400' : 'text-gray-400'
          )} />
          <div className={cn(
            'text-xl font-bold transition-colors',
            liveStats.blockersCount > 0 ? 'text-red-400' : 'text-gray-400'
          )}>
            {liveStats.blockersCount}
          </div>
          <div className="text-xs text-ink-muted mt-1">Blockers</div>
        </div>
      </div>

      {/* Real-time Activity Bar */}
      <div className="mt-3 flex gap-3">
        <div className={cn(
          'flex-1 bg-terminal-900/30 rounded-lg p-2 text-center transition-all duration-300',
          liveStats.wsConnected && 'bg-terminal-900/50'
        )}>
          <Clock className={cn(
            'w-4 h-4 mx-auto mb-1 transition-colors',
            liveStats.wsConnected ? 'text-terminal-300' : 'text-terminal-600'
          )} />
          <div className="text-xs text-ink-muted">Real-time</div>
          {liveStats.lastUpdate && (
            <div className="text-xs text-terminal-400 mt-1">
              {liveStats.lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className={cn(
          'flex-1 bg-blue-900/30 rounded-lg p-2 text-center transition-all duration-300',
          activityPulse && 'bg-blue-900/50'
        )}>
          <Zap className={cn(
            'w-4 h-4 mx-auto mb-1 transition-colors',
            activityPulse ? 'text-blue-300' : 'text-blue-400'
          )} />
          <div className="text-xs text-ink-muted">Live Updates</div>
          {liveStats.recentActivity > 0 && (
            <div className="text-xs text-blue-400 mt-1">
              {liveStats.recentActivity} events
            </div>
          )}
        </div>
      </div>

      {/* Event Stream Indicator */}
      {realtimeDashboard.eventCount > 0 && (
        <div className="mt-3 bg-surface-1 rounded-lg p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Event Stream</span>
            <span className="text-terminal-400 font-medium">
              {realtimeDashboard.eventCount} total events
            </span>
          </div>
          
          {realtimeDashboard.lastEvent && (
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-ink-muted">Last:</span>
              <span className="text-blue-400 font-mono">
                {realtimeDashboard.lastEvent.type}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RealtimeDashboardStats