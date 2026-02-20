/**
 * Touch feedback components for mobile interfaces - Refactored Version
 * Provides visual feedback, haptic feedback, and improved touch interactions
 * 
 * This file re-exports focused components for backward compatibility
 */

// Export utilities
export { 
  triggerHapticFeedback, 
  isHapticFeedbackSupported,
  type HapticFeedbackType 
} from './haptic-feedback'

export {
  getPressAnimationClasses,
  getMinTouchSizeClasses, 
  getTouchInteractionClasses,
  type PressStyle
} from './touch-animations'

// Export types
export type {
  TouchableBaseProps,
  TouchableButtonProps,
  TouchableLinkProps,
  TouchableAreaProps,
  FloatingActionButtonProps,
  PressIndicatorProps
} from './touch-feedback-types'

// Export components
export { TouchableButton } from './touchable-button'
export { TouchableArea } from './touchable-area'
export { FloatingActionButton } from './floating-action-button'

// Legacy component exports for backward compatibility
export const TouchFeedbackButton = TouchableButton
export const TouchFeedbackArea = TouchableArea
export const FAB = FloatingActionButton