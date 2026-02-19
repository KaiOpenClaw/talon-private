'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TouchCard } from './touch-feedback';
import { useDeviceOptimizations } from './mobile-optimized-layout';
import { MobileSkeleton } from './mobile-loading';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
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
  const device = useDeviceOptimizations();
  
  const variantClasses = {
    default: 'border-border-subtle',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50', 
    error: 'border-red-200 bg-red-50/50'
  };

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3 text-green-500" />,
    down: <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />,
    stable: <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
  };

  if (loading) {
    return (
      <MobileSkeleton 
        variant="dashboard" 
        className={className}
      />
    );
  }

  const cardContent = (
    <>
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

      {/* Value */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-ink-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <div className="text-sm text-ink-muted mt-1">
            {subtitle}
          </div>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1">
          {trendIcons[trend]}
          {trendValue && (
            <span className={cn(
              "text-xs font-medium",
              trend === 'up' && "text-green-600",
              trend === 'down' && "text-red-600",
              trend === 'stable' && "text-gray-600"
            )}>
              {trendValue}
            </span>
          )}
        </div>
      )}
    </>
  );

  const cardClasses = cn(
    "p-4 bg-surface-1 rounded-lg border",
    "min-h-[100px]", // Ensure minimum touch target
    variantClasses[variant],
    (href || onClick) && "cursor-pointer hover:shadow-md transition-shadow",
    className
  );

  if (href) {
    return (
      <Link href={href}>
        <TouchCard className={cardClasses}>
          {cardContent}
        </TouchCard>
      </Link>
    );
  }

  return (
    <TouchCard 
      onClick={onClick}
      className={cardClasses}
    >
      {cardContent}
    </TouchCard>
  );
}