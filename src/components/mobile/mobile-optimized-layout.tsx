/**
 * Enhanced mobile-optimized layout system for Talon
 * Provides responsive breakpoints, touch-friendly interactions, and performance optimizations
 */

'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import TouchableBase from './touch-feedback'

interface MobileLayoutProps {
  children: ReactNode
  /** Enable advanced mobile optimizations */
  enableOptimizations?: boolean
  /** Custom breakpoint overrides */
  breakpoints?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  /** Performance settings */
  performance?: {
    /** Enable lazy loading for off-screen content */
    lazyLoad?: boolean
    /** Reduce animations on slower devices */
    reduceMotion?: boolean
    /** Optimize for battery usage */
    powerSaving?: boolean
  }
}

/**
 * Device detection and optimization hook
 */
function useDeviceOptimizations() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    isLowPower: false,
    pixelRatio: 1,
    orientation: 'portrait' as 'portrait' | 'landscape'
  })

  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isLandscape = useMediaQuery('(orientation: landscape)')

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile,
        isTablet,
        isTouch: 'ontouchstart' in window,
        isLowPower: 'getBattery' in navigator, // More complex battery API logic could be added
        pixelRatio: window.devicePixelRatio || 1,
        orientation: isLandscape ? 'landscape' : 'portrait'
      })
    }

    updateDeviceInfo()
    
    // Update on orientation change
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100) // Small delay for accurate detection
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', updateDeviceInfo)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', updateDeviceInfo)
    }
  }, [isMobile, isTablet, isLandscape])

  return {
    ...deviceInfo,
    shouldReduceMotion: prefersReducedMotion || deviceInfo.isLowPower
  }
}

/**
 * Enhanced mobile layout wrapper with optimizations
 */
export function MobileOptimizedLayout({
  children,
  enableOptimizations = true,
  breakpoints = {},
  performance = {}
}: MobileLayoutProps) {
  const device = useDeviceOptimizations()
  const {
    lazyLoad = true,
    reduceMotion = true,
    powerSaving = true
  } = performance

  // Apply performance optimizations based on device capabilities
  const layoutClasses = cn(
    "min-h-screen relative",
    // Reduce animations on low-power devices
    device.shouldReduceMotion && reduceMotion && "reduce-motion",
    // Optimize for touch devices
    device.isTouch && "touch-device",
    // Orientation-specific optimizations
    device.orientation === 'landscape' && device.isMobile && "mobile-landscape"
  )

  // Performance CSS variables
  const performanceStyles = enableOptimizations ? {
    '--mobile-touch-target': '44px',
    '--mobile-font-scale': device.isMobile ? '1' : '1.1',
    '--mobile-line-height': device.isMobile ? '1.4' : '1.5',
    '--mobile-spacing-unit': device.isMobile ? '0.75rem' : '1rem'
  } as React.CSSProperties : {}

  return (
    <div 
      className={layoutClasses}
      style={performanceStyles}
      data-device-mobile={device.isMobile}
      data-device-tablet={device.isTablet}
      data-device-touch={device.isTouch}
    >
      {children}
    </div>
  )
}

/**
 * Mobile-optimized button component with touch feedback
 */
export function MobileButton({
  children,
  onClick,
  className,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  hapticFeedback = true,
  ...props
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
  loading?: boolean
  hapticFeedback?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const device = useDeviceOptimizations()
  
  const handleClick = useCallback(() => {
    if (disabled || loading) return
    
    // Provide haptic feedback on supported devices
    if (hapticFeedback && device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(10) // Light haptic feedback
    }
    
    onClick?.()
  }, [disabled, loading, hapticFeedback, device.isTouch, onClick])

  const baseClasses = cn(
    // Touch-friendly minimum size
    "min-h-[44px] min-w-[44px] relative overflow-hidden",
    "font-medium rounded-lg transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    // Active state for better touch feedback
    "active:scale-95",
    // Disabled state
    disabled && "opacity-50 cursor-not-allowed",
    // Loading state
    loading && "cursor-wait"
  )

  const variantClasses = {
    primary: "bg-terminal-500 text-white hover:bg-terminal-600 focus:ring-terminal-400 active:bg-terminal-700",
    secondary: "bg-surface-2 text-ink-secondary hover:bg-surface-3 focus:ring-terminal-400",
    ghost: "text-ink-secondary hover:bg-surface-2 focus:ring-terminal-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 active:bg-red-700"
  }

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-3 text-sm",
    large: "px-6 py-4 text-base"
  }

  return (
    <TouchableBase hapticFeedback={hapticFeedback && !disabled && !loading ? "light" : false}>
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </button>
    </TouchableBase>
  )
}

/**
 * Mobile-optimized card component with touch interactions
 */
export function MobileCard({
  children,
  onClick,
  className,
  interactive = false,
  padding = 'default'
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  interactive?: boolean
  padding?: 'none' | 'small' | 'default' | 'large'
}) {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    default: 'p-4',
    large: 'p-6'
  }

  const baseClasses = cn(
    "bg-surface-1 rounded-lg border border-border-subtle",
    interactive && [
      "cursor-pointer transition-all duration-200",
      "hover:bg-surface-2 hover:border-border-subtle-hover",
      "active:scale-[0.98] active:bg-surface-3",
      "focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2"
    ],
    paddingClasses[padding]
  )

  if (interactive && onClick) {
    return (
      <TouchableBase
        hapticFeedback="light"
        className={cn(baseClasses, className)}
        onClick={onClick}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick()
            }
          }}
        >
          {children}
        </div>
      </TouchableBase>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  )
}

/**
 * Mobile-optimized input component
 */
export function MobileInput({
  className,
  type = 'text',
  autoCorrect = "off",
  autoCapitalize = "off",
  spellCheck = false,
  ...props
}: {
  className?: string
  type?: string
  autoCorrect?: string
  autoCapitalize?: string
  spellCheck?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  
  const device = useDeviceOptimizations()

  const baseClasses = cn(
    "w-full min-h-[44px] px-4 py-3 rounded-lg border border-border-subtle",
    "bg-surface-0 text-ink-primary placeholder-ink-muted",
    "focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:border-terminal-400",
    "transition-colors duration-200",
    // Mobile-specific optimizations
    device.isMobile && "text-base", // Prevents zoom on iOS
    className
  )

  return (
    <input
      className={baseClasses}
      type={type}
      autoCorrect={autoCorrect ? 'on' : 'off'}
      autoCapitalize={autoCapitalize ? 'on' : 'off'}
      spellCheck={spellCheck}
      {...props}
    />
  )
}

/**
 * Responsive grid system optimized for mobile
 */
export function MobileGrid({
  children,
  columns = 1,
  gap = 'default',
  className
}: {
  children: ReactNode
  columns?: number | { mobile?: number, tablet?: number, desktop?: number }
  gap?: 'none' | 'small' | 'default' | 'large'
  className?: string
}) {
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    default: 'gap-4',
    large: 'gap-6'
  }

  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${Math.min(columns, 12)}`
    }
    
    const { mobile = 1, tablet = 2, desktop = 3 } = columns
    return cn(
      `grid-cols-${Math.min(mobile, 12)}`,
      `md:grid-cols-${Math.min(tablet, 12)}`,
      `lg:grid-cols-${Math.min(desktop, 12)}`
    )
  }

  return (
    <div className={cn(
      "grid",
      getGridColumns(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

export {
  useDeviceOptimizations,
  type MobileLayoutProps
}

export default MobileOptimizedLayout