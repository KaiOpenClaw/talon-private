'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Clock, 
  Zap, 
  Activity, 
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  Loader2 
} from 'lucide-react'
import { useRealtimeSessions } from '@/hooks/useEnhancedWebSocket'
import { cn } from '@/lib/utils'

interface Session {
  key: string
  kind: string
  agentId?: string
  model?: string
  channel?: string
  lastActivity?: string
  messageCount?: number
  status?: 'active' | 'idle' | 'processing' | 'error'
}

interface RealtimeSessionIndicatorProps {
  session: Session
  className?: string
  showDetails?: boolean
  variant?: 'minimal' | 'compact' | 'detailed'
}

export function RealtimeSessionIndicator({
  session,
  className,
  showDetails = true,
  variant = 'compact'
}: RealtimeSessionIndicatorProps) {
  const { lastUpdate, connected } = useRealtimeSessions()
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(session.messageCount || 0)
  const [pulseActivity, setPulseActivity] = useState(false)

  // Detect new messages
  useEffect(() => {
    if (session.messageCount && session.messageCount > lastMessageCount) {
      setIsUpdating(true)
      setPulseActivity(true)
      setLastMessageCount(session.messageCount)
      
      const timeout = setTimeout(() => {
        setIsUpdating(false)
        setPulseActivity(false)
      }, 3000)
      
      return () => clearTimeout(timeout)
    }
  }, [session.messageCount, lastMessageCount])

  // Pulse on global session updates
  useEffect(() => {
    if (lastUpdate && connected) {
      setPulseActivity(true)
      const timeout = setTimeout(() => setPulseActivity(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [lastUpdate, connected])

  const getSessionStatus = () => {
    if (isUpdating) return 'processing'
    if (!session.lastActivity) return 'idle'
    
    const lastActivity = new Date(session.lastActivity)
    const now = new Date()
    const minutesAgo = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
    
    if (minutesAgo < 5) return 'active'
    if (minutesAgo < 30) return 'idle'
    return 'idle'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-3 h-3 text-green-500" />
      case 'processing':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case 'idle':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return <CheckCircle className="w-3 h-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-400 bg-green-50 dark:bg-green-900/20'
      case 'processing': return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'idle': return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
      case 'error': return 'border-red-400 bg-red-50 dark:bg-red-900/20'
      default: return 'border-gray-300 bg-white dark:bg-gray-800'
    }
  }

  const status = getSessionStatus()

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center space-x-1', className)}>
        {getStatusIcon(status)}
        {connected && (
          <div className={cn(
            'w-2 h-2 rounded-full transition-all duration-200',
            pulseActivity ? 'bg-green-400 animate-ping' : 'bg-gray-300'
          )} />
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'inline-flex items-center space-x-2 px-2 py-1 rounded-md border transition-all duration-200',
        getStatusColor(status),
        pulseActivity && 'ring-2 ring-blue-400/50',
        className
      )}>
        {getStatusIcon(status)}
        
        <div className="flex items-center space-x-1">
          {session.agentId && (
            <Bot className="w-3 h-3 text-gray-600" />
          )}
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {session.agentId || 'Session'}
          </span>
        </div>

        {session.messageCount && (
          <div className={cn(
            'flex items-center space-x-1 text-xs',
            isUpdating ? 'text-blue-600 animate-pulse' : 'text-gray-500'
          )}>
            <MessageCircle className="w-3 h-3" />
            <span>{session.messageCount}</span>
          </div>
        )}

        {connected && (
          <Zap className={cn(
            'w-3 h-3 transition-colors duration-200',
            pulseActivity ? 'text-green-500' : 'text-gray-400'
          )} />
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all duration-200',
      getStatusColor(status),
      pulseActivity && 'ring-2 ring-blue-400/50 shadow-lg',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {session.agentId || 'Unknown Agent'}
            </h4>
            <div className="text-xs text-gray-500">
              {session.key.slice(0, 8)}...
            </div>
          </div>
        </div>

        {isUpdating && (
          <div className="flex items-center space-x-1 text-blue-600">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-medium">Updating</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <MessageCircle className={cn(
              'w-4 h-4 mx-auto mb-1',
              isUpdating ? 'text-blue-500 animate-pulse' : 'text-gray-500'
            )} />
            <div className={cn(
              'text-sm font-medium',
              isUpdating ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
            )}>
              {session.messageCount || 0}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>

          <div className="text-center">
            <User className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.channel || 'Direct'}
            </div>
            <div className="text-xs text-gray-500">Channel</div>
          </div>

          <div className="text-center">
            <Bot className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.model || 'Default'}
            </div>
            <div className="text-xs text-gray-500">Model</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status === 'active' && 'bg-green-100 text-green-800',
            status === 'processing' && 'bg-blue-100 text-blue-800',
            status === 'idle' && 'bg-gray-100 text-gray-800',
            status === 'error' && 'bg-red-100 text-red-800'
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>

          {connected && (
            <div className="flex items-center space-x-1">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                pulseActivity ? 'bg-green-400 animate-ping' : 'bg-green-400'
              )} />
              <span className="text-gray-500">Live</span>
            </div>
          )}
        </div>

        {session.lastActivity && (
          <div className="text-gray-500">
            {new Date(session.lastActivity).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Real-time Event Indicator */}
      {lastUpdate && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last sync:</span>
            <span className="font-mono">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealtimeSessionIndicator