/**
 * Swipe Gesture Component
 * Advanced swipe gesture with velocity detection
 */
'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { SwipeGestureProps, Point } from './advanced-gesture-types'

export function SwipeGestureArea({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3,
  className,
  disabled = false
}: SwipeGestureProps) {
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [startTime, setStartTime] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    setStartPoint({ x: touch.clientX, y: touch.clientY })
    setStartTime(Date.now())
  }, [disabled])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !startPoint || e.changedTouches.length !== 1) return
    
    const touch = e.changedTouches[0]
    const endPoint = { x: touch.clientX, y: touch.clientY }
    const deltaX = endPoint.x - startPoint.x
    const deltaY = endPoint.y - startPoint.y
    const deltaTime = Date.now() - startTime
    
    // Calculate velocity (pixels per ms)
    const velocityX = Math.abs(deltaX) / deltaTime
    const velocityY = Math.abs(deltaY) / deltaTime
    
    // Determine primary direction
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    // Check if gesture meets threshold and velocity requirements
    if (absDeltaX > absDeltaY && absDeltaX > threshold && velocityX > velocity) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold && velocityY > velocity) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }
    
    setStartPoint(null)
  }, [disabled, startPoint, startTime, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return (
    <div
      ref={containerRef}
      className={cn("touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling but capture horizontal swipes
    >
      {children}
    </div>
  )
}