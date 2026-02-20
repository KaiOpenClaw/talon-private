/**
 * Real-time Status Components
 * Shows WebSocket connection status and live activity indicators
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  Users, 
  Clock,
  CheckCircle, 
  AlertCircle,
  RefreshCw 
} from 'lucide-react'
import { useEnhancedWebSocket } from '@/hooks/useEnhancedWebSocket'
import { cn } from '@/lib/utils'

interface RealtimeStatusProps {
  variant?: 'minimal' | 'compact' | 'detailed'
  className?: string
  showClientCount?: boolean
  showLastActivity?: boolean
}

export function RealtimeStatus({
  variant = 'compact',
  className,
  showClientCount = true,
  showLastActivity = true
}: RealtimeStatusProps) {
  const webSocket = useEnhancedWebSocket()
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusColor = () => {
    if (webSocket.reconnecting) return 'text-yellow-500'
    if (webSocket.connected) return 'text-green-500'
    if (webSocket.error) return 'text-red-500'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (webSocket.reconnecting) return <RefreshCw className="w-4 h-4 animate-spin" />
    if (webSocket.connected) return <Wifi className="w-4 h-4" />
    return <WifiOff className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (webSocket.reconnecting) return 'Reconnecting...'
    if (webSocket.connected) return 'Live'
    if (webSocket.error) return 'Error'
    return 'Offline'
  }

  if (variant === 'minimal') {
    return (
      <div 
        className={cn('relative inline-flex items-center', className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={cn('transition-colors duration-200', getStatusColor())}>
          {getStatusIcon()}
        </div>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
            <div className="font-medium">WebSocket: {getStatusText()}</div>
            {webSocket.serverStats && (
              <div className="text-gray-300 mt-1">
                {webSocket.serverStats.totalClients} clients connected
              </div>
            )}
            {webSocket.lastEvent && (
              <div className="text-gray-300 mt-1">
                Last: {webSocket.lastEvent.type}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'inline-flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm',
        className
      )}>
        <div className={cn('transition-colors duration-200', getStatusColor())}>
          {getStatusIcon()}
        </div>
        
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {getStatusText()}
        </span>

        {webSocket.connected && webSocket.eventCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {webSocket.eventCount} events
          </span>
        )}

        {showClientCount && webSocket.serverStats && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{webSocket.serverStats.totalClients}</span>
          </div>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Real-time Connection
        </h3>
        <div className={cn('transition-colors duration-200', getStatusColor())}>
          {getStatusIcon()}
        </div>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <div className="flex items-center space-x-2">
            {webSocket.connected ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={cn(
              'text-sm font-medium',
              webSocket.connected ? 'text-green-600' : 'text-red-600'
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Connection Time */}
        {webSocket.connected && webSocket.connectionTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {webSocket.connectionTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Event Count */}
        {webSocket.connected && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
            <span className="text-sm text-blue-600 font-medium">
              {webSocket.eventCount}
            </span>
          </div>
        )}

        {/* Server Stats */}
        {webSocket.serverStats && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Clients</span>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {webSocket.serverStats.totalClients}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Event History</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {webSocket.serverStats.eventHistory}
              </span>
            </div>
          </div>
        )}

        {/* Last Event */}
        {webSocket.lastEvent && showLastActivity && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Event</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Type</span>
                <span className="text-xs font-mono text-blue-600">
                  {webSocket.lastEvent.type}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Time</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {new Date(webSocket.lastEvent.data.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {webSocket.lastEvent.data.source && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Source</span>
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {webSocket.lastEvent.data.source}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {webSocket.error && (
          <div className="pt-3 border-t border-red-200">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{webSocket.error}</span>
            </div>
            
            <button
              onClick={webSocket.reconnect}
              className="mt-2 w-full px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Live Activity Pulse Indicator
 */
interface LiveActivityPulseProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LiveActivityPulse({ className, size = 'md' }: LiveActivityPulseProps) {
  const webSocket = useEnhancedWebSocket()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (webSocket.lastEvent) {
      setIsActive(true)
      const timeout = setTimeout(() => setIsActive(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [webSocket.lastEvent])

  if (!webSocket.connected || !isActive) return null

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
      <div className={cn(
        'relative bg-green-500 rounded-full',
        sizeClasses[size]
      )}></div>
    </div>
  )
}

/**
 * Connection Health Badge
 */
interface ConnectionHealthBadgeProps {
  className?: string
}

export function ConnectionHealthBadge({ className }: ConnectionHealthBadgeProps) {
  const webSocket = useEnhancedWebSocket()

  const getBadgeVariant = () => {
    if (webSocket.reconnecting) return 'warning'
    if (webSocket.connected && !webSocket.error) return 'success'
    if (webSocket.connected && webSocket.error) return 'warning'
    return 'error'
  }

  const getHealthScore = () => {
    if (!webSocket.connected) return 'Disconnected'
    if (webSocket.error) return 'Poor'
    if (webSocket.eventCount === 0) return 'Connected'
    return 'Excellent'
  }

  const variantStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variantStyles[getBadgeVariant()],
      className
    )}>
      {getHealthScore()}
    </span>
  )
}

export default RealtimeStatus