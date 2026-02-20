/**
 * Advanced Mobile Gesture Components - Refactored
 * Multi-touch gestures, pinch-to-zoom, and advanced swipe patterns
 * 
 * Re-exports focused components for backward compatibility
 */

// Export types
export type {
  Point,
  GestureState,
  SwipeGestureProps,
  PinchZoomProps, 
  LongPressProps,
  MultiGestureProps
} from './advanced-gesture-types'

// Export components
export { SwipeGestureArea } from './swipe-gesture'
export { PinchZoomArea } from './pinch-zoom'
export { LongPressArea } from './long-press'
export { MultiGestureArea } from './multi-gesture'

// Export hook
export { useGestures } from './use-gestures'