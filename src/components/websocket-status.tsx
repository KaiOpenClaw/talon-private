/**
 * WebSocket Status Indicator
 * Shows real-time connection status and activity
 */

import { useState } from 'react'
import { useWebSocketStatus, useLiveActivity } from '@/hooks/useWebSocket'

interface WebSocketStatusProps {
  showDetails?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WebSocketStatus({ 
  showDetails = false, 
  className = '',
  size = 'md'
}: WebSocketStatusProps) {
  const { connected, reconnecting, lastConnected, errorCount, reconnect } = useWebSocketStatus()
  const { isActive, lastActivity, activityType } = useLiveActivity()
  const [showTooltip, setShowTooltip] = useState(false)

  // Determine status color and icon
  const getStatusColor = () => {
    if (reconnecting) return 'text-yellow-500'
    if (connected && isActive) return 'text-green-400'
    if (connected) return 'text-green-500'
    return 'text-red-500'
  }

  const getStatusIcon = () => {
    if (reconnecting) return '🔄'
    if (connected && isActive) return '🟢'
    if (connected) return '🟡'
    return '🔴'
  }

  const getStatusText = () => {
    if (reconnecting) return 'Reconnecting...'
    if (connected && isActive) return 'Live'
    if (connected) return 'Connected'
    return 'Disconnected'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  if (!showDetails) {
    // Minimal indicator
    return (
      <div 
        className={`relative inline-flex items-center ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={`${getStatusColor()} transition-colors duration-200`}>
          {getStatusIcon()}
        </span>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
            WebSocket: {getStatusText()}
            {connected && lastActivity && (
              <div className="text-gray-300">
                Last: {lastActivity.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Detailed status card
  return (
    <div className={`inline-flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg border ${sizeClasses[size]} ${className}`}>
      <span className={`${getStatusColor()} transition-colors duration-200`}>
        {getStatusIcon()}
      </span>
      
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {getStatusText()}
      </span>

      {connected && isActive && activityType && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {activityType.replace('_', ' ')}
        </span>
      )}

      {errorCount > 0 && (
        <span className="text-xs text-red-500">
          {errorCount} errors
        </span>
      )}

      {!connected && (
        <button
          onClick={reconnect}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          Retry
        </button>
      )}

      {connected && lastConnected && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Since {lastConnected.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

/**
 * Live Activity Pulse
 * Animated indicator for real-time activity
 */
export function LiveActivityPulse({ className = '' }: { className?: string }) {
  const { isActive } = useLiveActivity()

  if (!isActive) return null

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
      <div className="relative bg-green-500 rounded-full w-2 h-2"></div>
    </div>
  )
}

/**
 * Connection Health Badge
 * Shows overall connection health
 */
export function ConnectionHealthBadge({ className = '' }: { className?: string }) {
  const { connected, reconnecting, errorCount } = useWebSocketStatus()

  const getBadgeColor = () => {
    if (reconnecting) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (connected && errorCount === 0) return 'bg-green-100 text-green-800 border-green-200'
    if (connected && errorCount > 0) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getHealthScore = () => {
    if (!connected) return 'Poor'
    if (errorCount === 0) return 'Excellent'
    if (errorCount < 3) return 'Good'
    return 'Fair'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor()} ${className}`}>
      Connection: {getHealthScore()}
    </span>
  )
}

/**
 * Real-time Event Log
 * Shows recent WebSocket events (for debugging)
 */
export function RealtimeEventLog({ 
  maxEvents = 5, 
  className = '' 
}: { 
  maxEvents?: number
  className?: string 
}) {
  const [events, setEvents] = useState<Array<{
    type: string
    timestamp: Date
    data: unknown
  }>>([])

  // This would need the useAllWebSocketEvents hook, but keeping it simple for now
  // In a real implementation, you'd subscribe to all events

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Real-time Events
      </h4>
      
      {events.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No recent events
        </p>
      ) : (
        <div className="space-y-1">
          {events.slice(-maxEvents).map((event, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-300 font-mono">
              <span className="text-gray-400">
                {event.timestamp.toLocaleTimeString()}
              </span>
              {' '}
              <span className="text-blue-600 dark:text-blue-400">
                {event.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WebSocketStatus