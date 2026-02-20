/**
 * TypeScript types for touch feedback components
 */

import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import type { HapticFeedbackType } from './haptic-feedback'
import type { PressStyle } from './touch-animations'

export interface TouchableBaseProps {
  children: ReactNode
  className?: string
  /** Enable haptic feedback on press (default: false) */
  hapticFeedback?: boolean | HapticFeedbackType
  /** Custom press animation style */
  pressStyle?: PressStyle
  /** Minimum touch target size (default: false) */
  minTouchSize?: boolean
}

export interface TouchableButtonProps 
  extends TouchableBaseProps, 
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {}

export interface TouchableLinkProps 
  extends TouchableBaseProps,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> {}

export interface TouchableAreaProps extends TouchableBaseProps {
  /** Element type to render */
  as?: 'div' | 'span' | 'section' | 'article'
}

export interface FloatingActionButtonProps extends TouchableBaseProps {
  /** FAB size variant */
  size?: 'default' | 'large'
  /** FAB position (fixed positioning) */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export interface PressIndicatorProps {
  /** Show visual press indicator */
  show: boolean
  /** Indicator size */
  size?: 'small' | 'medium' | 'large'
  /** Custom position */
  x?: number
  y?: number
}