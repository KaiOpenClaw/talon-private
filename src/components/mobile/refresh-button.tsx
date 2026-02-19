'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TouchButton } from './touch-feedback';

interface MobileRefreshButtonProps {
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Mobile-optimized refresh button with haptic feedback
 */
export function MobileRefreshButton({
  onRefresh,
  loading = false,
  className
}: MobileRefreshButtonProps) {
  return (
    <TouchButton
      onClick={onRefresh}
      disabled={loading}
      className={cn("w-10 h-10 p-0 bg-transparent border-0", className)}
      hapticFeedback="medium"
      aria-label="Refresh"
    >
      <RefreshCw className={cn(
        "w-4 h-4",
        loading && "animate-spin"
      )} />
    </TouchButton>
  );
}