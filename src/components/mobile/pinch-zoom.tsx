/**
 * Pinch Zoom Component
 * Pinch-to-zoom gesture for data visualization
 */
'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { PinchZoomProps, GestureState, Point } from './advanced-gesture-types'

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