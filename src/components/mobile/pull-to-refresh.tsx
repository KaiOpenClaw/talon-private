/**
 * Pull-to-refresh component for mobile Talon experience
 * Addresses Discord mobile pain points with native refresh gestures
 */

'use client';

import { ReactNode, useRef, useState, useCallback, TouchEventHandler } from 'react';
import { RefreshCw } from 'lucide-react';
import { logApiError } from '@/lib/logger';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 80;
const REFRESH_DISTANCE = 100;

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = PULL_THRESHOLD,
  disabled = false,
  className = '' 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);

  const handleTouchStart: TouchEventHandler = useCallback((e) => {
    if (disabled || isRefreshing) return;

    const scrollElement = e.currentTarget as HTMLElement;
    isAtTop.current = scrollElement.scrollTop === 0;
    
    if (isAtTop.current) {
      startY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove: TouchEventHandler = useCallback((e) => {
    if (!canPull || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY - startY.current);
    
    // Only allow pull if we're at the top of the container
    const scrollElement = e.currentTarget as HTMLElement;
    if (scrollElement.scrollTop > 0) {
      setCanPull(false);
      setPullDistance(0);
      return;
    }

    // Add resistance to the pull
    const adjustedDistance = pullDistance * 0.4;
    setPullDistance(Math.min(adjustedDistance, REFRESH_DISTANCE));

    // Prevent default scrolling when pulling
    if (pullDistance > 10) {
      e.preventDefault();
    }
  }, [canPull, disabled, isRefreshing]);

  const handleTouchEnd: TouchEventHandler = useCallback(async () => {
    if (!canPull || disabled) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
      } catch (error) {
        logApiError(error, { 
          component: 'PullToRefresh', 
          action: 'refresh',
          pullDistance,
          isOverThreshold 
        });
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Animate back to original position
      setPullDistance(0);
    }
  }, [canPull, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const isOverThreshold = pullDistance >= threshold;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}  
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateY(${pullDistance}px)` }}
    >
      {/* Pull-to-refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-surface-1 border-b border-accent/20 transition-all duration-300"
        style={{ 
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`,
          opacity: isRefreshing ? 1 : refreshOpacity 
        }}
      >
        <div className="flex items-center gap-2 text-text-secondary">
          <RefreshCw 
            className={`w-5 h-5 transition-all duration-300 ${
              isRefreshing 
                ? 'animate-spin text-accent' 
                : isOverThreshold 
                  ? 'text-accent scale-110' 
                  : 'text-text-muted'
            }`}
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : isOverThreshold 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="transition-transform duration-300 ease-out">
        {children}
      </div>
    </div>
  );
}

// Hook for managing pull-to-refresh state
export function usePullToRefresh() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async (refreshFn: () => Promise<void> | void) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshFn();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return {
    lastRefresh,
    isRefreshing,
    refresh
  };
}

// Mobile-optimized refresh button for fallback
export function MobileRefreshButton({ 
  onRefresh, 
  isRefreshing = false 
}: { 
  onRefresh: () => void; 
  isRefreshing?: boolean; 
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-4 py-2 bg-surface-1 border border-accent/20 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-2 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}