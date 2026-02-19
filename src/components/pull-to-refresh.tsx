'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logApiError } from '@/lib/logger'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  refreshTriggerHeight?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  refreshTriggerHeight = 80,
  className
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  // Check if we can pull (at top of page)
  const checkCanPull = () => {
    if (!containerRef.current) return false
    const scrollTop = containerRef.current.scrollTop
    return scrollTop <= 0
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    touchStartY.current = e.touches[0].clientY
    setCanPull(checkCanPull())
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return

    const touchY = e.touches[0].clientY
    const deltaY = touchY - touchStartY.current

    // Only handle downward pulls
    if (deltaY > 0) {
      e.preventDefault()
      isDragging.current = true
      
      // Apply resistance curve for smooth feel
      const resistance = Math.pow(deltaY / (refreshTriggerHeight * 2), 0.7)
      const pullDistance = deltaY * resistance
      
      setPullDistance(Math.min(pullDistance, refreshTriggerHeight))
    }
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !isDragging.current) return

    isDragging.current = false

    // Trigger refresh if pulled far enough
    if (pullDistance >= refreshTriggerHeight) {
      setIsRefreshing(true)
      
      try {
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        
        await onRefresh()
      } catch (error) {
        logApiError(error, { 
          component: 'PullToRefresh',
          action: 'refresh',
          pullDistance,
          refreshTriggerHeight 
        })
      } finally {
        setIsRefreshing(false)
      }
    }

    // Animate back to rest position
    setPullDistance(0)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Use passive listeners for better performance
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [disabled, isRefreshing, canPull, pullDistance])

  const refreshProgress = pullDistance / refreshTriggerHeight
  const showRefreshIndicator = pullDistance > 0 || isRefreshing

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isDragging.current ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {showRefreshIndicator && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center justify-center py-4"
          style={{
            transform: `translateX(-50%) translateY(${-refreshTriggerHeight + pullDistance}px)`,
            opacity: Math.min(refreshProgress, 1)
          }}
        >
          <div className="flex items-center gap-2 text-primary">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </>
            ) : pullDistance >= refreshTriggerHeight ? (
              <>
                <ChevronDown className="h-5 w-5 rotate-180" />
                <span className="text-sm font-medium">Release to refresh</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-5 w-5" />
                <span className="text-sm font-medium">Pull to refresh</span>
              </>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="w-12 h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${Math.min(refreshProgress * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-full">
        {children}
      </div>
    </div>
  )
}

// Simplified hook for easy integration
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options?: { disabled?: boolean }
) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (options?.disabled || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return { isRefreshing, handleRefresh }
}

// Mobile-specific refresh component for lists
export function MobilePullRefresh({ 
  children, 
  onRefresh, 
  className 
}: { 
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string 
}) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={cn("h-full", className)}
      refreshTriggerHeight={60}
    >
      {children}
    </PullToRefresh>
  )
}