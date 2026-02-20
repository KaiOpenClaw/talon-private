/**
 * TouchableArea - Generic touchable component with haptic feedback
 */

'use client'

import { createElement, forwardRef } from 'react'
import { triggerHapticFeedback, getHapticType } from './haptic-feedback'
import { getTouchInteractionClasses } from './touch-animations'
import type { TouchableAreaProps } from './touch-feedback-types'

interface TouchableAreaPropsWithEvents extends TouchableAreaProps {
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export const TouchableArea = forwardRef<HTMLDivElement, TouchableAreaPropsWithEvents>(
  ({
    children,
    className,
    hapticFeedback = false,
    pressStyle = 'scale',
    minTouchSize = false,
    as = 'div',
    onTouchStart: originalOnTouchStart,
    ...props
  }, ref) => {
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      const hapticType = getHapticType(hapticFeedback)
      if (hapticType) {
        triggerHapticFeedback(hapticType)
      }
      // Call original onTouchStart if provided
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