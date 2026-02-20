/**
 * Advanced Gesture Type Definitions
 */
import { ReactNode } from 'react'

export interface Point {
  x: number
  y: number
}

export interface GestureState {
  scale: number
  rotation: number
  translation: Point
  velocity: Point
  isActive: boolean
}

export interface SwipeGestureProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  velocity?: number
  className?: string
  disabled?: boolean
}

export interface PinchZoomProps {
  children: ReactNode
  minScale?: number
  maxScale?: number
  className?: string
  disabled?: boolean
  onScaleChange?: (scale: number) => void
}

export interface LongPressProps {
  children: ReactNode
  onLongPress: () => void
  delay?: number
  className?: string
  disabled?: boolean
}

export interface MultiGestureProps extends SwipeGestureProps, PinchZoomProps, LongPressProps {
  enableSwipe?: boolean
  enablePinchZoom?: boolean
  enableLongPress?: boolean
}