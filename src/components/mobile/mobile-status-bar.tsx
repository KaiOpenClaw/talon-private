/**
 * Mobile Status Bar and Safe Area Components
 * Handle iOS notch, Android status bars, and platform-specific UI
 */

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Hook to get safe area insets on iOS and Android
 */
export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateInsets = () => {
      // Check for CSS environment variables (iOS)
      const top = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0
      const right = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0
      const bottom = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0
      const left = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0

      setInsets({ top, right, bottom, left })
    }

    updateInsets()

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateInsets, 100) // Delay for accurate measurements
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', updateInsets)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', updateInsets)
    }
  }, [])

  return insets
}

interface MobileStatusBarProps {
  /** Background color for the status bar */
  backgroundColor?: string
  /** Status bar style - light or dark icons */
  barStyle?: 'light-content' | 'dark-content' | 'default'
  /** Hide the status bar completely */
  hidden?: boolean
  /** Enable translucent status bar */
  translucent?: boolean
}

/**
 * Mobile Status Bar component for cross-platform status bar styling
 */
export function MobileStatusBar({
  backgroundColor = '#0a0a0b',
  barStyle = 'light-content',
  hidden = false,
  translucent = false
}: MobileStatusBarProps) {
  const safeAreaInsets = useSafeAreaInsets()
  
  useEffect(() => {
    // Set meta theme-color for Android
    const existingMeta = document.querySelector('meta[name="theme-color"]')
    if (existingMeta) {
      existingMeta.setAttribute('content', backgroundColor)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = backgroundColor
      document.head.appendChild(meta)
    }

    // Set iOS status bar style
    const existingStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    const statusBarStyle = barStyle === 'light-content' ? 'black-translucent' : 'default'
    
    if (existingStatusMeta) {
      existingStatusMeta.setAttribute('content', statusBarStyle)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'apple-mobile-web-app-status-bar-style'
      meta.content = statusBarStyle
      document.head.appendChild(meta)
    }

    // Set viewport for safe areas
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      const content = viewport.getAttribute('content') || ''
      if (!content.includes('viewport-fit=cover')) {
        viewport.setAttribute('content', `${content}, viewport-fit=cover`)
      }
    }
  }, [backgroundColor, barStyle])

  if (hidden) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        translucent ? "bg-transparent" : "bg-surface-1"
      )}
      style={{
        height: safeAreaInsets.top || 44, // Default iOS status bar height
        backgroundColor: translucent ? 'transparent' : backgroundColor,
        paddingTop: safeAreaInsets.top
      }}
    />
  )
}

interface SafeAreaViewProps {
  children: React.ReactNode
  className?: string
  /** Apply safe area to specific edges */
  edges?: ('top' | 'right' | 'bottom' | 'left')[]
  /** Minimum safe area values */
  minimum?: Partial<SafeAreaInsets>
}

/**
 * Safe Area View component that respects device safe areas
 */
export function SafeAreaView({ 
  children, 
  className,
  edges = ['top', 'right', 'bottom', 'left'],
  minimum = {}
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets()
  
  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? Math.max(insets.top, minimum.top || 0) : 0,
    paddingRight: edges.includes('right') ? Math.max(insets.right, minimum.right || 0) : 0,
    paddingBottom: edges.includes('bottom') ? Math.max(insets.bottom, minimum.bottom || 0) : 0,
    paddingLeft: edges.includes('left') ? Math.max(insets.left, minimum.left || 0) : 0,
  }

  return (
    <div 
      className={cn("h-full w-full", className)}
      style={safeAreaStyle}
    >
      {children}
    </div>
  )
}

/**
 * Hook to detect device type and capabilities
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    hasNotch: false,
    isLandscape: false,
    screenHeight: 0,
    screenWidth: 0,
    devicePixelRatio: 1
  })

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (navigator as any).standalone === true
    
    // Detect notch/safe area
    const hasNotch = window.screen.height === 812 || // iPhone X/XS
                     window.screen.height === 896 || // iPhone XR/XS Max
                     window.screen.height === 844 || // iPhone 12/13 mini
                     window.screen.height === 926 || // iPhone 12/13 Pro Max
                     window.CSS?.supports?.('padding-top: env(safe-area-inset-top)') || false

    const updateScreenInfo = () => {
      setDeviceInfo(prev => ({
        ...prev,
        isLandscape: window.innerWidth > window.innerHeight,
        screenHeight: window.innerHeight,
        screenWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio || 1
      }))
    }

    setDeviceInfo({
      isIOS,
      isAndroid,
      isPWA,
      hasNotch,
      isLandscape: window.innerWidth > window.innerHeight,
      screenHeight: window.innerHeight,
      screenWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio || 1
    })

    window.addEventListener('resize', updateScreenInfo)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateScreenInfo, 100)
    })

    return () => {
      window.removeEventListener('resize', updateScreenInfo)
      window.removeEventListener('orientationchange', updateScreenInfo)
    }
  }, [])

  return deviceInfo
}

/**
 * Component to handle iOS keyboard appearance adjustments
 */
export function IOSKeyboardSpacer() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const deviceInfo = useDeviceInfo()

  useEffect(() => {
    if (!deviceInfo.isIOS) return

    const handleViewportChange = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
      
      setKeyboardHeight(keyboardHeight)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const screenHeight = window.screen.height
      const heightDifference = screenHeight - currentHeight
      
      // Assume keyboard is open if height difference is significant
      if (heightDifference > 150) {
        setKeyboardHeight(heightDifference)
      } else {
        setKeyboardHeight(0)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [deviceInfo.isIOS])

  if (!deviceInfo.isIOS || keyboardHeight === 0) return null

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-transparent pointer-events-none"
      style={{ height: keyboardHeight }}
    />
  )
}

/**
 * Hook for keyboard height detection
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
        setKeyboardHeight(keyboardHeight)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
      }
    }
  }, [])

  return keyboardHeight
}

/**
 * Mobile-optimized bottom sheet that respects safe areas
 */
interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  className
}: MobileBottomSheetProps) {
  const safeAreaInsets = useSafeAreaInsets()
  const keyboardHeight = useKeyboardHeight()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "absolute left-0 right-0 bg-surface-1 rounded-t-xl border-t border-border-subtle",
          "transform transition-transform duration-300 ease-out",
          "max-h-[90vh] overflow-hidden",
          className
        )}
        style={{
          bottom: Math.max(safeAreaInsets.bottom, keyboardHeight),
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-8 h-1 bg-ink-muted rounded-full" />
        </div>
        
        {/* Content */}
        <div 
          className="overflow-y-auto"
          style={{ 
            maxHeight: `calc(90vh - ${safeAreaInsets.bottom + keyboardHeight}px)` 
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default MobileStatusBar