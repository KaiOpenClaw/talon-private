'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotificationPermission = 'default' | 'granted' | 'denied'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface PushNotificationConfig {
  title: string
  body: string
  type?: NotificationType
  tag?: string
  icon?: string
  badge?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
}

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      
      // Show setup prompt if not configured
      const dismissed = localStorage.getItem('notifications-dismissed')
      if (Notification.permission === 'default' && !dismissed) {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        setShowPrompt(false)
        // Show success notification
        showNotification({
          title: 'Notifications Enabled!',
          body: 'You\'ll now receive updates about agent status and system events.',
          type: 'success',
          tag: 'setup-complete'
        })
        
        // Subscribe to push notifications if service worker is ready
        subscribeToaPush()
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }

  const subscribeToaPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY || '') as BufferSource
      })

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('notifications-dismissed', Date.now().toString())
  }

  if (!isSupported || !showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary/20 bg-black/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Enable Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Get notified about agent status changes, job failures, and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={requestPermission}
              className="flex-1 text-xs"
              size="sm"
            >
              <Bell className="h-3 w-3 mr-1" />
              Enable Notifications
            </Button>
            <Button
              variant="outline"
              onClick={dismissPrompt}
              size="sm"
              className="text-xs"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = 'Notification' in window
    setIsSupported(supported)
    
    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  const getStatusIcon = () => {
    switch (permission) {
      case 'granted': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'denied': return <BellOff className="h-4 w-4 text-red-500" />
      default: return <Bell className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (permission) {
      case 'granted': return 'Enabled'
      case 'denied': return 'Blocked'
      default: return 'Not set'
    }
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (permission) {
      case 'granted': return 'default'
      case 'denied': return 'destructive'
      default: return 'secondary'
    }
  }

  if (!isSupported) {
    return (
      <Badge variant="outline" className="text-xs">
        <BellOff className="h-3 w-3 mr-1" />
        Not supported
      </Badge>
    )
  }

  return (
    <Badge variant={getStatusVariant()} className="text-xs">
      {getStatusIcon()}
      <span className="ml-1">Notifications: {getStatusText()}</span>
    </Badge>
  )
}

// Utility function to show notifications
export function showNotification(config: PushNotificationConfig) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const icon = config.icon || getNotificationIcon(config.type)
  
  const notification = new Notification(config.title, {
    body: config.body,
    icon,
    badge: config.badge || '/icon-192.png',
    tag: config.tag,
    data: config.data,
    requireInteraction: config.requireInteraction || false,
    silent: config.silent || false,
  })

  // Auto-close after 5 seconds unless requireInteraction is true
  if (!config.requireInteraction) {
    setTimeout(() => notification.close(), 5000)
  }

  return notification
}

function getNotificationIcon(type?: NotificationType): string {
  const iconMap = {
    success: '/icon-192.png',
    error: '/icon-192.png', 
    warning: '/icon-192.png',
    info: '/icon-192.png'
  }
  return iconMap[type || 'info']
}

// Hook for push notification management
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)
    
    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied'

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const showNotification = (config: PushNotificationConfig) => {
    if (permission !== 'granted') return null
    return showNotification(config)
  }

  const notifyAgentStatus = (agentId: string, status: 'online' | 'offline' | 'error') => {
    const statusMessages = {
      online: `Agent ${agentId} is now online`,
      offline: `Agent ${agentId} went offline`,
      error: `Agent ${agentId} encountered an error`
    }
    
    const statusTypes: Record<string, NotificationType> = {
      online: 'success',
      offline: 'warning', 
      error: 'error'
    }

    return showNotification({
      title: 'Agent Status Update',
      body: statusMessages[status],
      type: statusTypes[status],
      tag: `agent-${agentId}`,
      data: { agentId, status }
    })
  }

  const notifyJobFailure = (jobName: string, error: string) => {
    return showNotification({
      title: 'Job Failed',
      body: `${jobName}: ${error}`,
      type: 'error',
      tag: `job-${jobName}`,
      requireInteraction: true,
      data: { jobName, error }
    })
  }

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    notifyAgentStatus,
    notifyJobFailure
  }
}

// Utility function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}