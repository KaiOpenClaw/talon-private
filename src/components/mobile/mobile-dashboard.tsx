/**
 * Mobile-optimized dashboard components for Talon
 * Responsive cards, grids, and layouts optimized for touch interaction
 */

'use client';

// Re-export all mobile dashboard components for backward compatibility
export { 
  MobileDashboardCard, 
  type DashboardCardProps 
} from './dashboard-card';

export { MobileDashboardSection } from './dashboard-section';

export { MobileRefreshButton } from './refresh-button';

// Re-export mobile optimization utilities
export { MobileGrid, useDeviceOptimizations } from './mobile-optimized-layout';
export { TouchCard, TouchButton } from './touch-feedback';
export { MobileSkeleton } from './mobile-loading';