/**
 * Long Press Component
 * Long press gesture with haptic feedback
 */
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LongPressProps, Point } from './advanced-gesture-types'

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