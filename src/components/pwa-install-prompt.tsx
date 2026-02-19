'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Download, X } from 'lucide-react'
import { logApiError } from '@/lib/logger'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOSSafari, setIsIOSSafari] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Detect iOS Safari for manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSSafari = isIOS && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent)
    setIsIOSSafari(isIOSSafari)

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a short delay to avoid overwhelming users
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return // Don't show for a week
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowPrompt(false)
        setIsInstalled(true)
      } else {
        handleDismiss()
      }
    } catch (error) {
      logApiError(error, { 
        component: 'PWAInstallPrompt', 
        action: 'install',
        outcome: 'failed'
      })
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary/20 bg-black/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Install Talon</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Get the full app experience with offline access and faster loading
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isIOSSafari ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                To install on iOS Safari:
              </p>
              <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                <li>Tap the Share button</li>
                <li>Select "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1 text-xs"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Install App
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                size="sm"
                className="text-xs"
              >
                Maybe Later
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for programmatic access to PWA install state
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches
      setIsInstalled(standalone || fullscreen)
    }

    checkInstalled()

    // Listen for app install events
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true)
    }

    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return { isInstalled, canInstall }
}