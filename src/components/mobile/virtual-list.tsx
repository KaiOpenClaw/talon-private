/**
 * Mobile Virtual List Component
 * High-performance scrolling for large datasets with touch optimizations
 */

'use client'

import { useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
  loadingIndicator?: ReactNode
  emptyIndicator?: ReactNode
  isLoading?: boolean
  /** Enable touch optimizations for mobile */
  touchOptimized?: boolean
  /** Custom scroll behavior */
  scrollBehavior?: 'auto' | 'smooth'
}

/**
 * Mobile-optimized virtual list with smooth scrolling and touch interactions
 */
export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 0.8,
  loadingIndicator,
  emptyIndicator,
  isLoading = false,
  touchOptimized = true,
  scrollBehavior = 'auto'
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const containerHeight = height
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, height, itemHeight, overscan, items.length])

  // Generate visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    const itemsToRender = []
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        itemsToRender.push({
          index: i,
          item: items[i],
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight
          }
        })
      }
    }
    
    return itemsToRender
  }, [visibleRange, items, itemHeight])

  // Handle scroll events with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    setIsScrolling(true)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)

    // Check if end reached
    if (onEndReached) {
      const { scrollHeight, clientHeight } = e.currentTarget
      const scrollPercentage = (newScrollTop + clientHeight) / scrollHeight
      
      if (scrollPercentage >= endReachedThreshold && !isLoading) {
        onEndReached()
      }
    }
  }, [onEndReached, endReachedThreshold, isLoading])

  // Touch optimization: prevent iOS bounce scrolling at boundaries
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!touchOptimized) return

    const element = e.currentTarget
    const startY = e.touches[0].clientY

    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent
      const currentY = touchEvent.touches[0].clientY
      const scrollTop = element.scrollTop
      const maxScroll = element.scrollHeight - element.clientHeight

      // Prevent overscroll at top
      if (scrollTop <= 0 && currentY > startY) {
        touchEvent.preventDefault()
      }
      // Prevent overscroll at bottom  
      if (scrollTop >= maxScroll && currentY < startY) {
        touchEvent.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }

    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)
  }, [touchOptimized])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = scrollBehavior) => {
    if (!containerRef.current) return
    
    const top = index * itemHeight
    containerRef.current.scrollTo({
      top,
      behavior
    })
  }, [itemHeight, scrollBehavior])

  // Scroll to top
  const scrollToTop = useCallback((behavior: ScrollBehavior = scrollBehavior) => {
    if (!containerRef.current) return
    
    containerRef.current.scrollTo({
      top: 0,
      behavior
    })
  }, [scrollBehavior])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div 
        className={cn("flex items-center justify-center", className)}
        style={{ height }}
      >
        {emptyIndicator || (
          <div className="text-center py-8">
            <p className="text-ink-muted">No items to display</p>
          </div>
        )}
      </div>
    )
  }

  const totalHeight = items.length * itemHeight

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-auto",
        touchOptimized && "overscroll-none", // Prevent iOS bounce
        isScrolling && "pointer-events-none", // Optimize scroll performance
        className
      )}
      style={{ height }}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      role="list"
      aria-label={`Virtual list with ${items.length} items`}
    >
      {/* Virtual container with full height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Render visible items */}
        {visibleItems.map(({ index, item, style }) => (
          <div 
            key={index} 
            style={style}
            role="listitem"
            aria-rowindex={index + 1}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading indicator at bottom */}
        {isLoading && loadingIndicator && (
          <div
            style={{
              position: 'absolute',
              top: totalHeight,
              left: 0,
              right: 0,
              height: 60
            }}
            className="flex items-center justify-center"
          >
            {loadingIndicator}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Mobile-optimized virtual grid component
 */
interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'itemHeight'> {
  itemHeight: number
  itemWidth: number
  columns: number
  gap?: number
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemWidth,
  columns,
  gap = 0,
  renderItem,
  ...props
}: VirtualGridProps<T>) {
  // Convert grid items to rows for virtual list
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns))
    }
    return result
  }, [items, columns])

  const renderRow = useCallback((row: T[], rowIndex: number) => {
    return (
      <div 
        className="flex" 
        style={{ gap }}
        role="row"
      >
        {row.map((item, colIndex) => (
          <div
            key={rowIndex * columns + colIndex}
            style={{ 
              width: itemWidth,
              flexShrink: 0
            }}
            role="gridcell"
          >
            {renderItem(item, rowIndex * columns + colIndex)}
          </div>
        ))}
      </div>
    )
  }, [renderItem, columns, itemWidth, gap])

  return (
    <div role="grid" aria-label={`Virtual grid with ${items.length} items`}>
      <VirtualList
        items={rows}
        itemHeight={itemHeight + gap}
        renderItem={renderRow}
        {...props}
      />
    </div>
  )
}

/**
 * Hook for virtual list utilities
 */
export function useVirtualList<T>(items: T[]) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const scrollToIndex = useCallback((index: number) => {
    // Will be implemented by the component using this hook
    return index
  }, [])

  const scrollToTop = useCallback(() => {
    setScrollTop(0)
  }, [])

  return {
    scrollTop,
    isScrolling,
    scrollToIndex,
    scrollToTop,
    totalItems: items.length
  }
}

export default VirtualList