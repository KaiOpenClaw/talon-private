/**
 * PWA Installation Prompt Component
 * Provides native app installation experience with platform-specific UI
 */

'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchButton } from './touch-feedback'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios')
    } else if (/android/.test(userAgent)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }
  }, [])

  // Listen for install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show prompt after a short delay if user seems engaged
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  // Check if already in standalone mode
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (navigator as any).standalone === true
    setIsInstalled(isStandalone)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }
  }

  // Don't show if dismissed this session or already installed
  if (isInstalled || 
      (typeof window !== 'undefined' && sessionStorage.getItem('pwa-prompt-dismissed')) ||
      (!isInstallable && platform !== 'ios')) {
    return null
  }

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Install Talon',
          subtitle: 'Add to your home screen for the best experience',
          steps: [
            'Tap the Share button in Safari',
            'Select "Add to Home Screen"',
            'Tap "Add" to install'
          ],
          icon: <Smartphone className="w-6 h-6" />
        }
      case 'android':
        return {
          title: 'Install Talon App',
          subtitle: 'Get the full app experience',
          steps: isInstallable ? [] : [
            'Tap the menu button in Chrome',
            'Select "Add to Home screen"',
            'Tap "Add" to install'
          ],
          icon: <Download className="w-6 h-6" />
        }
      default:
        return {
          title: 'Install Talon Desktop',
          subtitle: 'Quick access from your desktop',
          steps: [],
          icon: <Monitor className="w-6 h-6" />
        }
    }
  }

  const instructions = getInstallInstructions()

  if (!showPrompt && platform === 'ios') {
    // Always show iOS instructions since there's no beforeinstallprompt
    return null
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-sm",
      "bg-surface-1 border border-border-subtle rounded-xl shadow-2xl",
      "transform transition-all duration-300 ease-out",
      showPrompt || platform === 'ios' ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terminal-500/10 rounded-lg text-terminal-400">
              {instructions.icon}
            </div>
            <div>
              <h3 className="font-semibold text-ink-primary">
                {instructions.title}
              </h3>
              <p className="text-sm text-ink-muted mt-1">
                {instructions.subtitle}
              </p>
            </div>
          </div>
          <TouchButton
            onClick={handleDismiss}
            className="p-2 bg-transparent border-0 text-ink-muted"
            hapticFeedback="light"
          >
            <X className="w-4 h-4" />
          </TouchButton>
        </div>

        {/* iOS Instructions */}
        {platform === 'ios' && instructions.steps.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-ink-tertiary mb-2">How to install:</div>
            <ol className="text-sm text-ink-secondary space-y-1">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 text-xs bg-terminal-500/20 text-terminal-400 rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Install Button (for non-iOS) */}
        {platform !== 'ios' && isInstallable && (
          <div className="flex gap-2">
            <TouchButton
              onClick={handleInstall}
              className="flex-1 bg-terminal-500 text-white hover:bg-terminal-600 border-0 min-h-[44px]"
              hapticFeedback="medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </TouchButton>
            <TouchButton
              onClick={handleDismiss}
              className="px-4 min-h-[44px] bg-surface-2 text-ink-secondary hover:bg-surface-3"
              hapticFeedback="light"
            >
              Later
            </TouchButton>
          </div>
        )}

        {/* Manual Instructions for non-installable browsers */}
        {platform !== 'ios' && !isInstallable && instructions.steps.length > 0 && (
          <div className="text-sm text-ink-secondary">
            <div className="text-xs text-ink-tertiary mb-2">Manual installation:</div>
            <ol className="space-y-1">
              {instructions.steps.map((step, index) => (
                <li key={index}>• {step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Features highlight */}
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="text-xs text-ink-tertiary mb-2">App features:</div>
          <div className="flex flex-wrap gap-2">
            {['Offline access', 'Fast startup', 'Push notifications', 'Home screen icon'].map((feature) => (
              <span 
                key={feature}
                className="px-2 py-1 bg-surface-2 text-ink-secondary text-xs rounded-md"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage PWA installation state
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (navigator as any).standalone === true
    setIsInstalled(isStandalone)

    // Listen for install availability
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return { canInstall, isInstalled }
}

export default PWAInstallPrompt