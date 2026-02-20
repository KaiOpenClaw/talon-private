'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BiometricAuthSetup } from '@/components/biometric-auth'
import { NotificationStatus } from '@/components/push-notifications'
import { usePWAInstall } from '@/components/pwa-install-prompt'
import { logger } from '@/lib/logger'
import { 
  Smartphone, 
  Fingerprint, 
  Bell, 
  Download, 
  Settings, 
  Shield,
  Wifi,
  Battery,
  Moon,
  Sun,
  Vibrate
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface DeviceInfo {
  userAgent: string
  platform: string
  isOnline: boolean
  connectionType?: string
  batteryLevel?: number
  isCharging?: boolean
}

export default function MobileSettingsPage() {
  const { isInstalled, canInstall } = usePWAInstall()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [preferences, setPreferences] = useState({
    darkMode: true,
    hapticFeedback: true,
    reducedMotion: false,
    autoRefresh: true,
    notificationSound: true
  })

  useEffect(() => {
    const getDeviceInfo = async () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return
      
      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isOnline: navigator.onLine
      }

      // Get connection info if available
      if ('connection' in navigator) {
        const connection = (navigator as { connection?: { effectiveType: string; downlink?: number } }).connection
        info.connectionType = connection?.effectiveType
      }

      // Get battery info if available
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as { getBattery: () => Promise<{ level: number; charging: boolean }> }).getBattery()
          info.batteryLevel = Math.round(battery.level * 100)
          info.isCharging = battery.charging
        } catch (error) {
          logger.debug('Battery API not available', { 
            component: 'MobileSettings',
            action: 'getBatteryInfo',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setDeviceInfo(info)
    }

    getDeviceInfo()

    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('mobile-preferences')
    if (savedPrefs) {
      setPreferences({ ...preferences, ...JSON.parse(savedPrefs) })
    }
  }, [])

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    localStorage.setItem('mobile-preferences', JSON.stringify(newPrefs))

    // Apply preferences immediately
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value)
    }
    if (key === 'reducedMotion') {
      document.documentElement.style.setProperty(
        '--motion-reduce', 
        value ? 'reduce' : 'no-preference'
      )
    }
  }

  const testHapticFeedback = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && preferences.hapticFeedback) {
      navigator.vibrate([50, 50, 100])
    }
  }

  const detectIOSVersion = () => {
    const match = deviceInfo?.userAgent.match(/OS (\d+)_(\d+)/)
    if (match) {
      return `${match[1]}.${match[2]}`
    }
    return null
  }

  const isIOS = /iPad|iPhone|iPod/.test(deviceInfo?.userAgent || '')
  const isAndroid = /Android/.test(deviceInfo?.userAgent || '')
  const iosVersion = isIOS ? detectIOSVersion() : null

  return (
    <div className="min-h-screen bg-black p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Mobile Settings</h1>
          <p className="text-muted-foreground">
            Configure your mobile experience with Talon
          </p>
        </div>

        {/* PWA Installation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              App Installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progressive Web App</p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled ? 'Installed and ready to use' : 
                   canInstall ? 'Available for installation' : 
                   'Not available on this device'}
                </p>
              </div>
              <Badge variant={isInstalled ? 'default' : canInstall ? 'secondary' : 'outline'}>
                {isInstalled ? 'Installed' : canInstall ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Stay updated with agent status and system alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationStatus />
          </CardContent>
        </Card>

        {/* Biometric Authentication */}
        <BiometricAuthSetup />

        {/* Mobile Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Mobile Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) => updatePreference('darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                <span>Haptic Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={preferences.hapticFeedback}
                  onCheckedChange={(checked) => updatePreference('hapticFeedback', checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testHapticFeedback}
                  disabled={!preferences.hapticFeedback}
                >
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Reduced Motion</span>
              </div>
              <Switch
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notification Sound</span>
              </div>
              <Switch
                checked={preferences.notificationSound}
                onCheckedChange={(checked) => updatePreference('notificationSound', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        {deviceInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Platform:</span>
                  <p className="text-muted-foreground">{deviceInfo.platform}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={deviceInfo.isOnline ? 'default' : 'destructive'}>
                    {deviceInfo.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                {deviceInfo.connectionType && (
                  <div>
                    <span className="font-medium">Connection:</span>
                    <p className="text-muted-foreground">{deviceInfo.connectionType.toUpperCase()}</p>
                  </div>
                )}

                {deviceInfo.batteryLevel !== undefined && (
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    <span className="font-medium">Battery:</span>
                    <span className="text-muted-foreground">
                      {deviceInfo.batteryLevel}% {deviceInfo.isCharging ? '(Charging)' : ''}
                    </span>
                  </div>
                )}

                {isIOS && iosVersion && (
                  <div>
                    <span className="font-medium">iOS Version:</span>
                    <p className="text-muted-foreground">{iosVersion}</p>
                  </div>
                )}

                {isAndroid && (
                  <div>
                    <span className="font-medium">Platform:</span>
                    <p className="text-muted-foreground">Android</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <span className="font-medium text-xs">User Agent:</span>
                <p className="text-xs text-muted-foreground break-all mt-1">
                  {deviceInfo.userAgent}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Mobile Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Service Worker</span>
                <Badge variant={typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'default' : 'outline'}>
                  {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <Badge variant={typeof window !== 'undefined' && 'Notification' in window ? 'default' : 'outline'}>
                  {typeof window !== 'undefined' && 'Notification' in window ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Web Authentication</span>
                <Badge variant={typeof navigator !== 'undefined' && 'credentials' in navigator ? 'default' : 'outline'}>
                  {typeof navigator !== 'undefined' && 'credentials' in navigator ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Vibration</span>
                <Badge variant={typeof navigator !== 'undefined' && 'vibrate' in navigator ? 'default' : 'outline'}>
                  {typeof navigator !== 'undefined' && 'vibrate' in navigator ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Geolocation</span>
                <Badge variant={typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'default' : 'outline'}>
                  {typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Battery Status</span>
                <Badge variant={typeof navigator !== 'undefined' && 'getBattery' in navigator ? 'default' : 'outline'}>
                  {typeof navigator !== 'undefined' && 'getBattery' in navigator ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}