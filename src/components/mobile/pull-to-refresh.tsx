/**
 * Pull-to-refresh component for mobile interfaces
 * Wraps content and provides pull-to-refresh functionality with visual feedback
 */

'use client'

import { ReactNode } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { usePullToRefresh, PullToRefreshOptions } from '@/hooks/usePullToRefresh'
import { cn } from '@/lib/utils'

interface PullToRefreshProps extends PullToRefreshOptions {
  children: ReactNode
  className?: string
  /** Custom refresh indicator component */
  indicator?: ReactNode
  /** Show pull-to-refresh hint text */
  showHint?: boolean
}

export function PullToRefresh({
  children,
  className,
  indicator,
  showHint = true,
  ...options
}: PullToRefreshProps) {
  const {
    pullDistance,
    isRefreshing,
    canRefresh,
    isPulling,
    containerRef,
    getIndicatorStyle,
    getContainerStyle
  } = usePullToRefresh(options)

  const defaultIndicator = (
    <div
      className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center py-4 -translate-y-full bg-surface-1 border-b border-border-subtle z-10"
      style={getIndicatorStyle()}
    >
      {/* Refresh Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          canRefresh ? "bg-terminal-500/20 text-terminal-400" : "bg-surface-3 text-ink-muted"
        )}
      >
        {isRefreshing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              canRefresh && "rotate-180"
            )}
          />
        )}
      </div>

      {/* Status Text */}
      <div className="mt-2 text-xs text-center">
        {isRefreshing ? (
          <span className="text-terminal-400">Refreshing...</span>
        ) : canRefresh ? (
          <span className="text-terminal-400">Release to refresh</span>
        ) : isPulling ? (
          <span className="text-ink-secondary">Pull to refresh</span>
        ) : showHint ? (
          <span className="text-ink-muted opacity-50">Pull down to refresh</span>
        ) : null}
      </div>

      {/* Progress Indicator */}
      {isPulling && !isRefreshing && (
        <div className="mt-2 w-16 h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-100 rounded-full",
              canRefresh ? "bg-terminal-400" : "bg-ink-muted"
            )}
            style={{
              width: `${Math.min((pullDistance / (options.threshold || 100)) * 100, 100)}%`
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Pull-to-refresh indicator */}
      {indicator || defaultIndicator}

      {/* Main content */}
      <div style={getContainerStyle()}>
        {children}
      </div>
    </div>
  )
}

/**
 * Mobile-optimized wrapper for pages that need pull-to-refresh
 * Includes proper spacing and mobile-first design considerations
 */
export function MobilePage({
  children,
  onRefresh,
  title,
  subtitle,
  headerActions,
  className
}: {
  children: ReactNode
  onRefresh?: () => Promise<void> | void
  title?: string
  subtitle?: string
  headerActions?: ReactNode
  className?: string
}) {
  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Mobile Header */}
      {(title || subtitle || headerActions) && (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-1">
          <div className="min-w-0">
            {title && (
              <h1 className="font-semibold truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-ink-muted truncate">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Content with pull-to-refresh */}
      <div className="flex-1 overflow-hidden">
        {onRefresh ? (
          <PullToRefresh
            onRefresh={onRefresh}
            className={cn("h-full overflow-auto", className)}
          >
            {children}
          </PullToRefresh>
        ) : (
          <div className={cn("h-full overflow-auto", className)}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export default PullToRefresh