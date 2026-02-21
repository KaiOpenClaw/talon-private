'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Zap, 
  Clock, 
  Activity,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useRealtimeDashboard, useRealtimeSessions, useRealtimeCronJobs } from '@/hooks/useEnhancedWebSocket'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { cn } from '@/lib/utils'

interface RealtimeNotification {
  id: string
  type: 'session_update' | 'session_created' | 'message_sent' | 'cron_triggered' | 'system_alert'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
  icon?: React.ReactNode
  autoClose?: number // Auto close after X milliseconds
}

interface RealtimeMobileNotificationsProps {
  className?: string
  maxNotifications?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  enableSound?: boolean
  enableHaptic?: boolean
  enablePush?: boolean
}

export function RealtimeMobileNotifications({
  className,
  maxNotifications = 5,
  position = 'top-right',
  enableSound = true,
  enableHaptic = true,
  enablePush = false
}: RealtimeMobileNotificationsProps) {
  const realtimeDashboard = useRealtimeDashboard()
  const realtimeSessions = useRealtimeSessions()
  const realtimeCronJobs = useRealtimeCronJobs()
  const { triggerHaptic } = useHapticFeedback()

  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Sound effect function
  const playNotificationSound = useCallback((priority: string) => {
    if (!enableSound) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different tones for different priorities
      switch (priority) {
        case 'critical':
          oscillator.frequency.value = 800
          gainNode.gain.value = 0.3
          break
        case 'high':
          oscillator.frequency.value = 600
          gainNode.gain.value = 0.2
          break
        case 'medium':
          oscillator.frequency.value = 400
          gainNode.gain.value = 0.1
          break
        default:
          oscillator.frequency.value = 300
          gainNode.gain.value = 0.05
      }
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Silently fail if audio context isn't supported
    }
  }, [enableSound])

  // Push notification function
  const sendPushNotification = useCallback(async (notification: RealtimeNotification) => {
    if (!enablePush || !('Notification' in window)) return

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/icon-192.png',
        tag: notification.id,
        timestamp: notification.timestamp.getTime(),
        requireInteraction: notification.priority === 'critical'
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        sendPushNotification(notification)
      }
    }
  }, [enablePush])

  // Add new notification
  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    // Trigger effects
    if (enableHaptic) {
      const hapticType = notification.priority === 'critical' ? 'error' : 
                         notification.priority === 'high' ? 'warning' : 'success'
      triggerHaptic(hapticType)
    }

    playNotificationSound(notification.priority)
    sendPushNotification(newNotification)

    // Auto close if specified
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, newNotification.autoClose)
    }

    setUnreadCount(prev => prev + 1)
  }, [maxNotifications, enableHaptic, triggerHaptic, playNotificationSound, sendPushNotification])

  // Handle dashboard events
  useEffect(() => {
    if (realtimeDashboard.lastEvent) {
      const event = realtimeDashboard.lastEvent
      
      addNotification({
        type: 'system_alert',
        title: 'System Update',
        message: `${event.type.replace('_', ' ')} event received`,
        priority: 'low',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        autoClose: 3000
      })
    }
  }, [realtimeDashboard.lastEvent, addNotification])

  // Handle session events
  useEffect(() => {
    if (realtimeSessions.lastUpdate) {
      const sessionCount = realtimeSessions.sessions.length
      
      addNotification({
        type: 'session_update',
        title: 'Sessions Updated',
        message: `${sessionCount} active session${sessionCount !== 1 ? 's' : ''}`,
        priority: 'low',
        icon: <MessageSquare className="w-4 h-4 text-green-500" />,
        autoClose: 4000
      })
    }
  }, [realtimeSessions.lastUpdate, realtimeSessions.sessions.length, addNotification])

  // Handle cron job events
  useEffect(() => {
    if (realtimeCronJobs.lastTriggered) {
      addNotification({
        type: 'cron_triggered',
        title: 'Job Triggered',
        message: `Cron job ${realtimeCronJobs.lastTriggered.slice(0, 8)}... executed`,
        priority: 'medium',
        icon: <Clock className="w-4 h-4 text-orange-500" />,
        autoClose: 5000
      })
    }
  }, [realtimeCronJobs.lastTriggered, addNotification])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4'
      case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right': return 'top-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      default: return 'top-4 right-4'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className={cn(
      'fixed z-50 max-w-sm w-full sm:w-96',
      getPositionClasses(),
      className
    )}>
      {/* Notification Bell/Toggle */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'relative bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border',
            'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          )}
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}

          {isExpanded ? (
            <ChevronUp className="absolute -bottom-1 -right-1 w-3 h-3 text-gray-500 bg-white dark:bg-gray-800 rounded-full" />
          ) : (
            <ChevronDown className="absolute -bottom-1 -right-1 w-3 h-3 text-gray-500 bg-white dark:bg-gray-800 rounded-full" />
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Notifications ({notifications.length})
              </h3>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-3 border-l-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                  'transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                  getPriorityColor(notification.priority),
                  !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.icon || <Bell className="w-4 h-4 text-gray-500" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn(
                          'text-sm font-medium text-gray-900 dark:text-gray-100',
                          !notification.read && 'font-semibold'
                        )}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>

                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Timestamp and actions */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>

                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}

                        {notification.actions?.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              action.action()
                              if (action.primary) markAsRead(notification.id)
                            }}
                            className={cn(
                              'text-xs px-2 py-1 rounded transition-colors',
                              action.primary 
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'text-blue-600 hover:text-blue-700 border border-blue-600 hover:bg-blue-50'
                            )}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Toast Notifications (when collapsed) */}
      {!isExpanded && notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 p-3',
            'animate-slide-in-right transition-all duration-300',
            getPriorityColor(notification.priority),
            !notification.read && 'ring-1 ring-blue-500/50'
          )}
        >
          <div className="flex items-start space-x-2">
            {notification.icon || <Bell className="w-4 h-4 text-gray-500 mt-0.5" />}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RealtimeMobileNotifications