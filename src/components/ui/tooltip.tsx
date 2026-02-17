/**
 * Simple Tooltip Component
 * Basic tooltip implementation for connection status
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let x = 0, y = 0

    switch (side) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.top - tooltipRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
    }

    setPosition({ x, y })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
    }
  }, [isVisible, side])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
        </div>
      )}
    </>
  )
}

// Provider components for compatibility with shadcn patterns
export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const TooltipTrigger: React.FC<{ 
  children: ReactNode
  asChild?: boolean 
}> = ({ children }) => {
  return <>{children}</>
}

export const TooltipContent: React.FC<{ 
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}> = ({ children }) => {
  return <>{children}</>
}