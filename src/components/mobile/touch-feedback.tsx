/**
 * Touch feedback components for mobile interfaces
 * Provides visual feedback, haptic feedback, and improved touch interactions
 */

'use client'

import { forwardRef, ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Utility function to trigger haptic feedback on supported devices
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    // Use Vibration API as fallback for haptic feedback
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    }
    navigator.vibrate(patterns[type])
  }
  
  // For iOS devices with Haptic Feedback API (if available)
  if (typeof window !== 'undefined' && 'HapticFeedback' in window) {
    const feedbackTypes = {
      light: 'impactLight',
      medium: 'impactMedium', 
      heavy: 'impactHeavy'
    }
    // @ts-ignore - HapticFeedback API is not in TypeScript definitions
    window.HapticFeedback?.impact(feedbackTypes[type])
  }
}

interface TouchableBaseProps {
  children: ReactNode
  className?: string
  /** Enable haptic feedback on press (default: false) */
  hapticFeedback?: boolean | 'light' | 'medium' | 'heavy'
  /** Custom press animation style */
  pressStyle?: 'scale' | 'fade' | 'glow' | 'none'
  /** Minimum touch target size (default: 44px) */
  minTouchSize?: boolean
}

/**
 * Base touchable component with press animations and haptic feedback
 */
function TouchableBase({
  children,
  className,
  hapticFeedback = false,
  pressStyle = 'scale',
  minTouchSize = true,
  as: Component = 'button',
  ...props
}: TouchableBaseProps & {
  as?: 'button' | 'div' | 'a'
  [key: string]: any
}) {
  const { onTouchStart, onTouchEnd, ...restProps } = props
  const handleTouchStart = (event: React.TouchEvent<any>) => {
    // Trigger haptic feedback
    if (hapticFeedback) {
      const feedbackType = typeof hapticFeedback === 'string' ? hapticFeedback : 'light'
      triggerHapticFeedback(feedbackType)
    }

    // Add active state class for visual feedback
    const target = event.currentTarget
    target.classList.add('touch-active')

    onTouchStart?.(event)
  }

  const handleTouchEnd = (event: React.TouchEvent<any>) => {
    // Remove active state class
    const target = event.currentTarget
    target.classList.remove('touch-active')

    onTouchEnd?.(event)
  }

  const pressClasses = {
    scale: 'active:scale-[0.97] touch-active:scale-[0.97]',
    fade: 'active:opacity-70 touch-active:opacity-70',
    glow: 'active:ring-2 active:ring-terminal-500/50 touch-active:ring-2 touch-active:ring-terminal-500/50',
    none: ''
  }

  const baseClasses = cn(
    'transition-all duration-150 ease-out',
    'select-none', // Prevent text selection
    'touch-manipulation', // Optimize for touch
    minTouchSize && 'min-w-[44px] min-h-[44px]', // Ensure minimum touch target
    pressClasses[pressStyle],
    className
  )

  return (
    <Component
      className={baseClasses}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...restProps}
    >
      {children}
    </Component>
  )
}

/**
 * Touchable button with mobile-optimized interactions
 */
export const TouchButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & TouchableBaseProps
>(({ children, className, ...props }, ref) => {
  return (
    <TouchableBase
      ref={ref}
      as="button"
      className={cn(
        'inline-flex items-center justify-center',
        'font-medium text-sm',
        'rounded-lg px-4 py-2',
        'bg-terminal-500 text-white',
        'hover:bg-terminal-600 focus:bg-terminal-600',
        'focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </TouchableBase>
  )
})
TouchButton.displayName = 'TouchButton'

/**
 * Touchable card component with press feedback
 */
export const TouchCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TouchableBaseProps
>(({ children, className, ...props }, ref) => {
  return (
    <TouchableBase
      ref={ref}
      as="div"
      className={cn(
        'block p-4 rounded-lg border border-border-subtle bg-surface-1',
        'hover:bg-surface-2 focus:bg-surface-2',
        'focus:outline-none focus:ring-2 focus:ring-terminal-400',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </TouchableBase>
  )
})
TouchCard.displayName = 'TouchCard'

/**
 * Touchable link with mobile-optimized styling
 */
export const TouchLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & TouchableBaseProps
>(({ children, className, ...props }, ref) => {
  return (
    <TouchableBase
      ref={ref}
      as="a"
      className={cn(
        'inline-flex items-center justify-center',
        'font-medium text-sm text-terminal-500',
        'rounded-lg px-3 py-2',
        'hover:bg-terminal-50 focus:bg-terminal-50',
        'focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </TouchableBase>
  )
})
TouchLink.displayName = 'TouchLink'

/**
 * Floating Action Button (FAB) for mobile interfaces
 */
export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & TouchableBaseProps & {
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
    size?: 'sm' | 'md' | 'lg'
  }
>(({ 
  children, 
  className, 
  position = 'bottom-right',
  size = 'md',
  ...props 
}, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6'
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  return (
    <TouchableBase
      ref={ref}
      as="button"
      hapticFeedback="medium"
      className={cn(
        'z-50',
        'rounded-full shadow-lg',
        'bg-terminal-500 text-white',
        'hover:bg-terminal-600 focus:bg-terminal-600',
        'focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center',
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </TouchableBase>
  )
})
FloatingActionButton.displayName = 'FloatingActionButton'

/**
 * Mobile-optimized tab button
 */
export const TouchTab = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & TouchableBaseProps & {
    active?: boolean
  }
>(({ children, className, active = false, ...props }, ref) => {
  return (
    <TouchableBase
      ref={ref}
      as="button"
      hapticFeedback="light"
      className={cn(
        'flex-1 py-3 px-4 text-center text-sm font-medium',
        'border-b-2 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:ring-offset-2',
        active
          ? 'border-terminal-500 text-terminal-600'
          : 'border-transparent text-ink-muted hover:text-ink-secondary',
        className
      )}
      {...props}
    >
      {children}
    </TouchableBase>
  )
})
TouchTab.displayName = 'TouchTab'

/**
 * Swipeable card component with gesture support
 */
export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  ...props
}: {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  [key: string]: any
}) {
  let startX = 0
  let startY = 0
  let isTracking = false

  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      isTracking = true
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!isTracking) return

    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY
    const deltaX = endX - startX
    const deltaY = endY - startY

    // Only trigger swipe if horizontal movement is dominant and significant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
      if (deltaX > 0 && onSwipeRight) {
        triggerHapticFeedback('medium')
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        triggerHapticFeedback('medium')
        onSwipeLeft()
      }
    }

    isTracking = false
  }

  return (
    <div
      className={cn(
        'touch-manipulation',
        'transition-transform duration-200',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Long press component with visual feedback
 */
export function LongPressButton({
  children,
  onLongPress,
  longPressDelay = 500,
  className,
  showProgress = true,
  ...props
}: {
  children: ReactNode
  onLongPress: () => void
  longPressDelay?: number
  className?: string
  showProgress?: boolean
  [key: string]: any
}) {
  let pressTimer: NodeJS.Timeout | null = null
  let progressTimer: NodeJS.Timeout | null = null

  const handleTouchStart = (event: React.TouchEvent) => {
    const element = event.currentTarget as HTMLElement
    
    // Start long press timer
    pressTimer = setTimeout(() => {
      triggerHapticFeedback('heavy')
      onLongPress()
      element.classList.remove('long-press-active')
    }, longPressDelay)

    // Add progress animation
    if (showProgress) {
      element.classList.add('long-press-active')
      element.style.setProperty('--long-press-duration', `${longPressDelay}ms`)
    }
  }

  const handleTouchEnd = () => {
    // Clear timers and reset styles
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
    if (progressTimer) {
      clearTimeout(progressTimer)
      progressTimer = null
    }

    // Remove progress animation
    const element = event?.currentTarget as HTMLElement
    element?.classList.remove('long-press-active')
  }

  return (
    <TouchableBase
      as="button"
      className={cn(
        'relative overflow-hidden',
        // Progress animation styles
        showProgress && [
          'before:absolute before:inset-0 before:bg-terminal-500/20',
          'before:transform before:scale-x-0 before:origin-left',
          'before:transition-transform before:duration-[var(--long-press-duration,500ms)]',
          'long-press-active:before:scale-x-100'
        ],
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      {...props}
    >
      {children}
    </TouchableBase>
  )
}

export default TouchableBase