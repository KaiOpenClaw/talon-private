'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TouchButton } from './touch-feedback';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: string | (() => void);
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Mobile dashboard section header with optional action
 */
export function MobileDashboardSection({
  title,
  subtitle,
  action,
  actionText = "View All",
  onAction,
  className
}: DashboardSectionProps) {
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
                hapticFeedback="light"
                className="bg-transparent border-0"
              >
                {actionText}
              </TouchButton>
            </Link>
          ) : (
            <TouchButton
              onClick={onAction}
              hapticFeedback="light"
              className="bg-transparent border-0"
            >
              {actionText}
            </TouchButton>
          )}
        </div>
      )}
    </div>
  );
}