/**
 * Mobile-optimized dashboard components for Talon
 * Responsive cards, grids, and layouts optimized for touch interaction
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, 
  Activity, 
  Users, 
  Calendar, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchCard, TouchButton } from './touch-feedback'
import { MobileGrid, useDeviceOptimizations } from './mobile-optimized-layout'
import { MobileSkeleton } from './mobile-loading'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  loading?: boolean
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Mobile-optimized dashboard card with touch interactions
 */
export function MobileDashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  loading = false,
  href,
  onClick,
  className,
  variant = 'default'
}: DashboardCardProps) {
  const device = useDeviceOptimizations()
  
  const variantClasses = {
    default: 'border-border-subtle',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50', 
    error: 'border-red-200 bg-red-50/50'
  }

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3 text-green-500" />,
    down: <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />,
    stable: <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
  }

  if (loading) {
    return (
      <MobileSkeleton 
        variant="dashboard" 
        className={className}
      />
    )
  }

  const content = (
    <div className={cn(
      "p-4 bg-surface-1 rounded-lg border",
      "min-h-[100px]", // Ensure minimum touch target
      variantClasses[variant],
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {icon && (
            <div className="text-ink-muted flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-ink-tertiary truncate">
            {title}
          </h3>
        </div>
        {(href || onClick) && (
          <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
        )}
      </div>

      {/* Main Value */}
      <div className="mb-2">
        <div className="text-2xl font-semibold text-ink-primary mb-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-ink-muted">
            {subtitle}
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && trendValue && (
        <div className="flex items-center gap-1">
          {trendIcons[trend]}
          <span className={cn(
            "text-xs font-medium",
            trend === 'up' && "text-green-600",
            trend === 'down' && "text-red-600", 
            trend === 'stable' && "text-gray-600"
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )

  // Render as link or interactive element
  if (href) {
    return (
      <Link href={href} className="block">
        <TouchCard 
          pressStyle="scale"
          hapticFeedback="light"
          className="!p-0 !bg-transparent !border-none"
        >
          {content}
        </TouchCard>
      </Link>
    )
  }

  if (onClick) {
    return (
      <TouchCard
        onClick={onClick}
        pressStyle="scale"
        hapticFeedback="light"
        className="!p-0 !bg-transparent !border-none"
      >
        {content}
      </TouchCard>
    )
  }

  return content
}

/**
 * Quick stats grid for mobile dashboard
 */
export function MobileQuickStats({
  stats,
  loading = false,
  className
}: {
  stats: Array<Omit<DashboardCardProps, 'className'>>
  loading?: boolean
  className?: string
}) {
  return (
    <MobileGrid
      columns={{ mobile: 2, tablet: 3, desktop: 4 }}
      gap="default"
      className={className}
    >
      {stats.map((stat, index) => (
        <MobileDashboardCard
          key={`${stat.title}-${index}`}
          loading={loading}
          {...stat}
        />
      ))}
    </MobileGrid>
  )
}

/**
 * Mobile-optimized agent status card
 */
export function MobileAgentCard({
  id,
  name,
  avatar,
  status,
  description,
  lastActivity,
  messageCount,
  onClick,
  className
}: {
  id: string
  name: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
  description?: string
  lastActivity?: string
  messageCount?: number
  onClick?: () => void
  className?: string
}) {
  const statusColors = {
    online: 'bg-green-400',
    busy: 'bg-yellow-400',
    offline: 'bg-gray-400'
  }

  const content = (
    <div className={cn(
      "p-4 bg-surface-1 rounded-lg border border-border-subtle",
      "min-h-[88px]", // Double minimum touch target for better usability
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
            {avatar}
          </div>
          {/* Status Indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            statusColors[status]
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-ink-primary truncate">
              {name}
            </h3>
            {onClick && (
              <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
            )}
          </div>
          
          {description && (
            <p className="text-sm text-ink-muted line-clamp-2 mb-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-ink-tertiary">
            {lastActivity && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastActivity}
              </span>
            )}
            {messageCount !== undefined && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-terminal-500 text-white text-[10px] flex items-center justify-center">
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
                messages
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <TouchCard
        onClick={onClick}
        pressStyle="scale"
        hapticFeedback="light"
        className="!p-0 !bg-transparent !border-none"
      >
        {content}
      </TouchCard>
    )
  }

  return content
}

/**
 * Mobile-optimized list item component
 */
export function MobileListItem({
  title,
  subtitle,
  value,
  icon,
  status,
  href,
  onClick,
  className
}: {
  title: string
  subtitle?: string
  value?: string
  icon?: ReactNode
  status?: 'success' | 'warning' | 'error' | 'neutral'
  href?: string
  onClick?: () => void
  className?: string
}) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    neutral: 'text-ink-muted'
  }

  const content = (
    <div className={cn(
      "flex items-center gap-3 p-4 min-h-[64px]",
      "bg-surface-1 border-b border-border-subtle last:border-b-0",
      className
    )}>
      {icon && (
        <div className="flex-shrink-0 text-ink-muted">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-ink-primary truncate mb-1">
          {title}
        </h4>
        {subtitle && (
          <p className="text-sm text-ink-muted truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <span className={cn(
            "text-sm font-medium",
            status ? statusColors[status] : 'text-ink-secondary'
          )}>
            {value}
          </span>
        )}
        {(href || onClick) && (
          <ChevronRight className="w-4 h-4 text-ink-muted" />
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <TouchCard
          pressStyle="fade"
          hapticFeedback="light"
          className="!p-0 !bg-transparent !border-none !rounded-none"
        >
          {content}
        </TouchCard>
      </Link>
    )
  }

  if (onClick) {
    return (
      <TouchCard
        onClick={onClick}
        pressStyle="fade"
        hapticFeedback="light"
        className="!p-0 !bg-transparent !border-none !rounded-none"
      >
        {content}
      </TouchCard>
    )
  }

  return content
}

/**
 * Mobile-optimized section header
 */
export function MobileSectionHeader({
  title,
  subtitle,
  action,
  actionText = "View All",
  onAction,
  className
}: {
  title: string
  subtitle?: string
  action?: string | (() => void)
  actionText?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 pb-2",
      className
    )}>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-ink-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-ink-muted mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {(action || onAction) && (
        <div className="flex-shrink-0">
          {typeof action === 'string' ? (
            <Link href={action}>
              <TouchButton
                variant="ghost"
                size="small"
                hapticFeedback="light"
              >
                {actionText}
              </TouchButton>
            </Link>
          ) : (
            <TouchButton
              onClick={onAction}
              variant="ghost"
              size="small"
              hapticFeedback="light"
            >
              {actionText}
            </TouchButton>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Mobile-optimized refresh button
 */
export function MobileRefreshButton({
  onRefresh,
  loading = false,
  className
}: {
  onRefresh: () => void
  loading?: boolean
  className?: string
}) {
  return (
    <TouchButton
      onClick={onRefresh}
      disabled={loading}
      variant="ghost"
      size="small"
      className={cn("w-10 h-10 p-0", className)}
      hapticFeedback="medium"
    >
      <RefreshCw className={cn(
        "w-4 h-4",
        loading && "animate-spin"
      )} />
    </TouchButton>
  )
}

export {
  type DashboardCardProps
}