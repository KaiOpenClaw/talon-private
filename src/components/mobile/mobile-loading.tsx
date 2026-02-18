/**
 * Mobile-optimized loading components with smooth animations and skeletons
 * Designed for touch interfaces and mobile viewports
 */

'use client'

import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileLoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showText?: boolean
}

/**
 * Primary mobile loading spinner with optional text
 */
export function MobileLoading({
  className,
  size = 'md',
  text = 'Loading...',
  showText = true
}: MobileLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <Loader2 className={cn("animate-spin text-terminal-500 mb-3", sizeClasses[size])} />
      {showText && (
        <p className="text-sm text-ink-muted">{text}</p>
      )}
    </div>
  )
}

/**
 * Skeleton loading component for mobile cards and lists
 */
export function MobileSkeleton({ 
  className,
  variant = 'default',
  animated = true
}: { 
  className?: string
  variant?: 'default' | 'card' | 'list' | 'chat' | 'dashboard'
  animated?: boolean
}) {
  const baseClasses = cn(
    "bg-surface-2 rounded",
    animated && "animate-pulse"
  )

  if (variant === 'card') {
    return (
      <div className={cn("p-4 bg-surface-1 rounded-lg border border-border-subtle", className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("w-10 h-10 rounded-lg", baseClasses)} />
          <div className="flex-1 space-y-2">
            <div className={cn("h-4 w-3/4", baseClasses)} />
            <div className={cn("h-3 w-1/2", baseClasses)} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={cn("h-3 w-full", baseClasses)} />
          <div className={cn("h-3 w-5/6", baseClasses)} />
          <div className={cn("h-3 w-4/6", baseClasses)} />
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("flex items-center gap-3 p-3", className)}>
        <div className={cn("w-8 h-8 rounded-full", baseClasses)} />
        <div className="flex-1 space-y-2">
          <div className={cn("h-4 w-1/2", baseClasses)} />
          <div className={cn("h-3 w-3/4", baseClasses)} />
        </div>
        <div className={cn("w-12 h-3", baseClasses)} />
      </div>
    )
  }

  if (variant === 'chat') {
    return (
      <div className={cn("flex gap-3 p-4", className)}>
        <div className={cn("w-8 h-8 rounded-lg flex-shrink-0", baseClasses)} />
        <div className="flex-1 space-y-2">
          <div className={cn("h-3 w-16", baseClasses)} />
          <div className={cn("h-4 w-full", baseClasses)} />
          <div className={cn("h-4 w-4/5", baseClasses)} />
          <div className={cn("h-4 w-2/3", baseClasses)} />
        </div>
      </div>
    )
  }

  if (variant === 'dashboard') {
    return (
      <div className={cn("p-4 bg-surface-1 rounded-lg border border-border-subtle", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-5 h-5 rounded", baseClasses)} />
            <div className={cn("h-5 w-20", baseClasses)} />
          </div>
          <div className={cn("h-4 w-12", baseClasses)} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className={cn("h-3 w-16", baseClasses)} />
            <div className={cn("h-4 w-8", baseClasses)} />
          </div>
          <div className="flex justify-between">
            <div className={cn("h-3 w-20", baseClasses)} />
            <div className={cn("h-4 w-6", baseClasses)} />
          </div>
          <div className="flex justify-between">
            <div className={cn("h-3 w-14", baseClasses)} />
            <div className={cn("h-4 w-10", baseClasses)} />
          </div>
        </div>
      </div>
    )
  }

  return <div className={cn("h-4 w-full", baseClasses, className)} />
}

/**
 * Loading grid for mobile dashboard layouts
 */
export function MobileLoadingGrid({
  count = 6,
  variant = 'card',
  className
}: {
  count?: number
  variant?: 'card' | 'list' | 'dashboard'
  className?: string
}) {
  const gridClasses = {
    card: "grid grid-cols-1 gap-4",
    list: "space-y-1",
    dashboard: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }

  return (
    <div className={cn(gridClasses[variant], className)}>
      {Array.from({ length: count }).map((_, index) => (
        <MobileSkeleton 
          key={index} 
          variant={variant}
        />
      ))}
    </div>
  )
}

/**
 * Enhanced loading state for mobile pages with proper spacing
 */
export function MobilePageLoading({
  title,
  showPullToRefreshHint = false,
  children
}: {
  title?: string
  showPullToRefreshHint?: boolean
  children?: ReactNode
}) {
  return (
    <div className="h-full overflow-auto">
      {/* Mobile header skeleton */}
      <div className="lg:hidden p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <MobileSkeleton className="w-6 h-6" />
            <MobileSkeleton className="h-5 w-32" />
          </div>
          <MobileSkeleton className="w-8 h-8" />
        </div>
      </div>

      {/* Pull-to-refresh hint */}
      {showPullToRefreshHint && (
        <div className="lg:hidden flex items-center justify-center py-2 text-xs text-ink-muted bg-surface-1/50">
          Pull down to refresh
        </div>
      )}

      {/* Content area */}
      <div className="p-4 pb-safe">
        {title && (
          <div className="mb-6">
            <MobileSkeleton className="h-6 w-48 mb-2" />
            <MobileSkeleton className="h-4 w-64" />
          </div>
        )}
        
        {children || <MobileLoadingGrid count={4} />}
      </div>
    </div>
  )
}

/**
 * Inline loading for mobile buttons and interactive elements
 */
export function MobileInlineLoading({
  children,
  loading,
  loadingText,
  size = 'sm'
}: {
  children: ReactNode
  loading: boolean
  loadingText?: string
  size?: 'sm' | 'md'
}) {
  if (!loading) return <>{children}</>

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn("animate-spin text-current", sizeClasses[size])} />
      {loadingText && (
        <span className="text-sm">{loadingText}</span>
      )}
    </div>
  )
}

/**
 * Mobile-optimized error state with retry button
 */
export function MobileError({
  title = "Something went wrong",
  message = "Please try again",
  onRetry,
  retryText = "Try Again"
}: {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <div className="text-red-500 text-lg">⚠️</div>
      </div>
      <h3 className="font-medium text-ink-primary mb-2">{title}</h3>
      <p className="text-sm text-ink-muted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-terminal-500 text-white rounded-lg text-sm font-medium hover:bg-terminal-600 active:bg-terminal-700 transition-colors min-h-[44px]"
        >
          {retryText}
        </button>
      )}
    </div>
  )
}

/**
 * Empty state component optimized for mobile
 */
export function MobileEmpty({
  icon,
  title = "Nothing here yet",
  message,
  action,
  actionText = "Get Started"
}: {
  icon?: ReactNode
  title?: string
  message?: string
  action?: () => void
  actionText?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="font-medium text-ink-primary mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-ink-muted mb-4 max-w-sm">{message}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-terminal-500 text-white rounded-lg text-sm font-medium hover:bg-terminal-600 active:bg-terminal-700 transition-colors min-h-[44px]"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default MobileLoading