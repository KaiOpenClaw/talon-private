/**
 * TouchableArea - Generic touchable component with haptic feedback
 */

'use client'

import { createElement, forwardRef } from 'react'
import { triggerHapticFeedback, getHapticType } from './haptic-feedback'
import { getTouchInteractionClasses } from './touch-animations'
import type { TouchableAreaProps } from './touch-feedback-types'

export const TouchableArea = forwardRef<HTMLDivElement, TouchableAreaProps>(
  ({
    children,
    className,
    hapticFeedback = false,
    pressStyle = 'scale',
    minTouchSize = false,
    as = 'div',
    ...props
  }, ref) => {
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      const hapticType = getHapticType(hapticFeedback)
      if (hapticType) {
        triggerHapticFeedback(hapticType)
      }
      // Call original onTouchStart if it exists in props
      const originalOnTouchStart = (props as any).onTouchStart
      originalOnTouchStart?.(e)
    }

    return createElement(
      as,
      {
        ref,
        className: getTouchInteractionClasses(pressStyle, minTouchSize, className),
        onTouchStart: handleTouchStart,
        ...props
      },
      children
    )
  }
)

TouchableArea.displayName = 'TouchableArea'