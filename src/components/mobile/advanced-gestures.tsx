/**
 * Advanced Mobile Gesture Components
 * Multi-touch gestures, pinch-to-zoom, and advanced swipe patterns
 */

'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Point {
  x: number
  y: number
}

interface GestureState {
  scale: number
  rotation: number
  translation: Point
  velocity: Point
  isActive: boolean
}

interface SwipeGestureProps {
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

/**
 * Advanced swipe gesture component with velocity detection
 */
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

interface PinchZoomProps {
  children: ReactNode
  minScale?: number
  maxScale?: number
  className?: string
  disabled?: boolean
  onScaleChange?: (scale: number) => void
}

/**
 * Pinch-to-zoom gesture component for data visualization
 */
export function PinchZoomArea({
  children,
  minScale = 0.5,
  maxScale = 3,
  className,
  disabled = false,
  onScaleChange
}: PinchZoomProps) {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1,
    rotation: 0,
    translation: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    isActive: false
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const initialDistance = useRef(0)
  const lastCenter = useRef<Point>({ x: 0, y: 0 })

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calculate center point between two touches
  const getCenter = useCallback((touch1: React.Touch, touch2: React.Touch): Point => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance.current = getDistance(touch1, touch2)
      lastCenter.current = getCenter(touch1, touch2)
      
      setGestureState(prev => ({
        ...prev,
        isActive: true
      }))
    }
  }, [disabled, getDistance, getCenter])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !gestureState.isActive || e.touches.length !== 2) return
    
    e.preventDefault()
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const currentDistance = getDistance(touch1, touch2)
    const currentCenter = getCenter(touch1, touch2)
    
    // Calculate scale
    const scale = Math.max(minScale, Math.min(maxScale, 
      gestureState.scale * (currentDistance / initialDistance.current)
    ))
    
    // Calculate translation
    const translation = {
      x: gestureState.translation.x + (currentCenter.x - lastCenter.current.x),
      y: gestureState.translation.y + (currentCenter.y - lastCenter.current.y)
    }
    
    lastCenter.current = currentCenter
    
    setGestureState(prev => ({
      ...prev,
      scale,
      translation
    }))
    
    onScaleChange?.(scale)
  }, [disabled, gestureState, getDistance, getCenter, minScale, maxScale, onScaleChange])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    if (e.touches.length < 2) {
      setGestureState(prev => ({
        ...prev,
        isActive: false
      }))
    }
  }, [disabled])

  // Reset gesture
  const reset = useCallback(() => {
    setGestureState({
      scale: 1,
      rotation: 0,
      translation: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      isActive: false
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      <div
        style={{
          transform: `translate(${gestureState.translation.x}px, ${gestureState.translation.y}px) scale(${gestureState.scale})`,
          transformOrigin: 'center',
          transition: gestureState.isActive ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
      
      {/* Reset button */}
      {(gestureState.scale !== 1 || gestureState.translation.x !== 0 || gestureState.translation.y !== 0) && (
        <button
          onClick={reset}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full z-10"
          aria-label="Reset zoom"
        >
          ⌂
        </button>
      )}
    </div>
  )
}

interface LongPressProps {
  children: ReactNode
  onLongPress: () => void
  delay?: number
  className?: string
  disabled?: boolean
}

/**
 * Long press gesture component with haptic feedback
 */
export function LongPressArea({
  children,
  onLongPress,
  delay = 500,
  className,
  disabled = false
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const startPos = useRef<Point>({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setIsPressed(true)
    
    timeoutRef.current = setTimeout(() => {
      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      onLongPress()
      setIsPressed(false)
    }, delay)
  }, [disabled, delay, onLongPress])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isPressed) return
    
    const touch = e.touches[0]
    const currentPos = { x: touch.clientX, y: touch.clientY }
    const distance = Math.sqrt(
      Math.pow(currentPos.x - startPos.current.x, 2) +
      Math.pow(currentPos.y - startPos.current.y, 2)
    )
    
    // Cancel if moved too far (more than 10px)
    if (distance > 10) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsPressed(false)
    }
  }, [disabled, isPressed])

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsPressed(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        "relative",
        isPressed && "scale-95 opacity-80",
        "transition-all duration-150",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
      {isPressed && (
        <div className="absolute inset-0 bg-terminal-500/10 rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

/**
 * Multi-gesture area combining multiple gesture types
 */
interface MultiGestureProps extends SwipeGestureProps, PinchZoomProps, LongPressProps {
  enableSwipe?: boolean
  enablePinchZoom?: boolean
  enableLongPress?: boolean
}

export function MultiGestureArea({
  children,
  enableSwipe = true,
  enablePinchZoom = false,
  enableLongPress = false,
  className,
  ...props
}: MultiGestureProps) {
  let component = children

  if (enableLongPress) {
    component = (
      <LongPressArea
        onLongPress={props.onLongPress!}
        delay={props.delay}
        disabled={props.disabled}
      >
        {component}
      </LongPressArea>
    )
  }

  if (enablePinchZoom) {
    component = (
      <PinchZoomArea
        minScale={props.minScale}
        maxScale={props.maxScale}
        disabled={props.disabled}
        onScaleChange={props.onScaleChange}
      >
        {component}
      </PinchZoomArea>
    )
  }

  if (enableSwipe) {
    component = (
      <SwipeGestureArea
        onSwipeLeft={props.onSwipeLeft}
        onSwipeRight={props.onSwipeRight}
        onSwipeUp={props.onSwipeUp}
        onSwipeDown={props.onSwipeDown}
        threshold={props.threshold}
        velocity={props.velocity}
        disabled={props.disabled}
      >
        {component}
      </SwipeGestureArea>
    )
  }

  return <div className={className}>{component}</div>
}

/**
 * Hook for gesture utilities
 */
export function useGestures() {
  const [activeGestures, setActiveGestures] = useState<string[]>([])

  const addGesture = useCallback((gesture: string) => {
    setActiveGestures(prev => [...prev, gesture])
  }, [])

  const removeGesture = useCallback((gesture: string) => {
    setActiveGestures(prev => prev.filter(g => g !== gesture))
  }, [])

  return {
    activeGestures,
    addGesture,
    removeGesture,
    hasActiveGesture: activeGestures.length > 0
  }
}

export {
  type GestureState,
  type Point
}