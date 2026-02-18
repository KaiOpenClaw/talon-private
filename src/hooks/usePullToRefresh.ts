/**
 * Pull-to-refresh hook for mobile interactions
 * Provides touch-based pull-to-refresh functionality with visual feedback
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  /** Callback function to execute when refresh is triggered */
  onRefresh: () => Promise<void> | void
  /** Distance in pixels to trigger refresh (default: 100) */
  threshold?: number
  /** Maximum pull distance in pixels (default: 150) */
  maxPullDistance?: number
  /** Resistance factor for pull feedback (default: 0.5) */
  resistance?: number
  /** Enable/disable the hook (default: true) */
  enabled?: boolean
}

interface PullToRefreshState {
  /** Current pull distance */
  pullDistance: number
  /** Whether refresh is in progress */
  isRefreshing: boolean
  /** Whether pull threshold has been reached */
  canRefresh: boolean
  /** Whether user is currently pulling */
  isPulling: boolean
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 100,
    maxPullDistance = 150,
    resistance = 0.5,
    enabled = true
  } = options

  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
    isPulling: false
  })

  const startY = useRef(0)
  const currentY = useRef(0)
  const pullStarted = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled || state.isRefreshing) return

    const scrollTop = containerRef.current?.scrollTop || window.scrollY
    
    // Only allow pull-to-refresh when at the top of the page/container
    if (scrollTop > 0) return

    startY.current = event.touches[0].clientY
    pullStarted.current = true

    setState(prev => ({ ...prev, isPulling: true }))
  }, [enabled, state.isRefreshing])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled || !pullStarted.current || state.isRefreshing) return

    currentY.current = event.touches[0].clientY
    const pullDistance = Math.max(0, currentY.current - startY.current)

    // Apply resistance to make pulling feel natural
    const resistedDistance = Math.min(
      pullDistance * resistance,
      maxPullDistance
    )

    // Prevent default scroll if we're pulling down
    if (pullDistance > 10) {
      event.preventDefault()
    }

    setState(prev => ({
      ...prev,
      pullDistance: resistedDistance,
      canRefresh: resistedDistance >= threshold,
      isPulling: true
    }))
  }, [enabled, resistance, maxPullDistance, threshold, state.isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !pullStarted.current) return

    const { canRefresh, pullDistance } = state

    pullStarted.current = false

    if (canRefresh && !state.isRefreshing) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pullDistance: threshold // Keep pulled position during refresh
      }))

      try {
        await onRefresh()
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false,
          isPulling: false
        }))
      }
    } else {
      // Animate back to original position
      setState(prev => ({
        ...prev,
        pullDistance: 0,
        canRefresh: false,
        isPulling: false
      }))
    }
  }, [enabled, state, threshold, onRefresh])

  // Set up touch event listeners
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current || document.body

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Reset state when disabled
  useEffect(() => {
    if (!enabled) {
      setState({
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false,
        isPulling: false
      })
    }
  }, [enabled])

  return {
    ...state,
    containerRef,
    // Helper function to get transform style for pull indicator
    getIndicatorStyle: () => ({
      transform: `translateY(${state.pullDistance}px)`,
      transition: state.isPulling ? 'none' : 'transform 0.3s ease-out'
    }),
    // Helper function to get container style for pulled content
    getContainerStyle: () => ({
      transform: `translateY(${state.pullDistance}px)`,
      transition: state.isPulling ? 'none' : 'transform 0.3s ease-out'
    })
  }
}

export type { PullToRefreshOptions, PullToRefreshState }