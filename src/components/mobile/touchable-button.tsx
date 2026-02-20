/**
 * TouchableButton - Button with haptic feedback and touch animations
 */

'use client'

import { forwardRef } from 'react'
import { triggerHapticFeedback, getHapticType } from './haptic-feedback'
import { getTouchInteractionClasses } from './touch-animations'
import type { TouchableButtonProps } from './touch-feedback-types'

export const TouchableButton = forwardRef<HTMLButtonElement, TouchableButtonProps>(
  ({
    children,
    className,
    hapticFeedback = false,
    pressStyle = 'scale',
    minTouchSize = true,
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
      // Trigger haptic feedback on click (for mouse/keyboard users)
      const hapticType = getHapticType(hapticFeedback)
      if (hapticType) {
        triggerHapticFeedback(hapticType)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={getTouchInteractionClasses(pressStyle, minTouchSize, className)}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

TouchableButton.displayName = 'TouchableButton'