/**
 * FloatingActionButton - Material Design inspired FAB with haptic feedback
 */

'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { triggerHapticFeedback, getHapticType } from './haptic-feedback'
import { getTouchInteractionClasses } from './touch-animations'
import type { FloatingActionButtonProps } from './touch-feedback-types'

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
}

const sizeClasses = {
  default: 'h-14 w-14',
  large: 'h-16 w-16'
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({
    children,
    className,
    hapticFeedback = 'medium',
    pressStyle = 'scale',
    minTouchSize = true,
    size = 'default',
    position = 'bottom-right',
    onTouchStart,
    onClick,
    ...props
  }, ref) => {
    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      const hapticType = getHapticType(hapticFeedback)
      if (hapticType) {
        triggerHapticFeedback(hapticType)
      }
      onTouchStart?.(e)
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const hapticType = getHapticType(hapticFeedback)
      if (hapticType) {
        triggerHapticFeedback(hapticType)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50',
          positionClasses[position],
          sizeClasses[size],
          getTouchInteractionClasses(pressStyle, minTouchSize),
          className
        )}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'