/**
 * Touch animation utilities and styles for mobile interactions
 * Provides various press animation effects
 */

import { cn } from '@/lib/utils'

export type PressStyle = 'scale' | 'fade' | 'glow' | 'none'

/**
 * Get CSS classes for touch press animations
 */
export function getPressAnimationClasses(pressStyle: PressStyle): string {
  const baseClasses = 'transition-all duration-150 ease-out active:transition-none'
  
  switch (pressStyle) {
    case 'scale':
      return cn(baseClasses, 'active:scale-95')
    case 'fade':
      return cn(baseClasses, 'active:opacity-60')
    case 'glow':
      return cn(baseClasses, 'active:shadow-lg active:shadow-blue-500/25')
    case 'none':
      return ''
    default:
      return cn(baseClasses, 'active:scale-95')
  }
}

/**
 * Get minimum touch target size classes (44px for accessibility)
 */
export function getMinTouchSizeClasses(enabled: boolean): string {
  return enabled ? 'min-h-11 min-w-11 p-2' : ''
}

/**
 * Combine touch interaction classes
 */
export function getTouchInteractionClasses(
  pressStyle: PressStyle,
  minTouchSize: boolean,
  className?: string
): string {
  return cn(
    getPressAnimationClasses(pressStyle),
    getMinTouchSizeClasses(minTouchSize),
    'select-none', // Prevent text selection on touch
    className
  )
}