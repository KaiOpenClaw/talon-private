'use client'

import { lazy, Suspense, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

// NOTE: Mobile components have complex export structures and are not currently used
// in the main application. Commenting out for now to focus on bigger bundle wins.

// TODO: Re-implement mobile component lazy loading once usage patterns are clarified

// const MobileShortcuts = lazy(() => import('./mobile/mobile-shortcuts'))
// ... other mobile components commented out for build stability

// Loading fallback component
const MobileComponentLoader = ({ height = "h-20" }: { height?: string }) => (
  <div className={`flex items-center justify-center ${height} bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse`}>
    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    <span className="ml-2 text-sm text-gray-500">Loading...</span>
  </div>
)

// Mobile component wrappers commented out - not currently used in main app
// Focus is on the bigger bundle optimizations that are actually providing value

/*
export const LazyMobileShortcuts = (props: any) => ...
export const LazyAdvancedGestures = (props: any) => ...
... other wrappers available when needed
*/

// Utility hook for conditional mobile loading
export const useMobileComponentLoader = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  return {
    isMobile,
    loadMobileComponent: <T extends ComponentType<any>>(
      component: () => Promise<{ default: T }>,
      fallback?: ComponentType
    ) => {
      if (!isMobile) {
        return fallback || (() => null)
      }
      return lazy(component)
    }
  }
}