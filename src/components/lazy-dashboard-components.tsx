'use client'

import { lazy, Suspense } from 'react'
import { Loader2, Search, Shield } from 'lucide-react'

// Lazy load heavy dashboard components to reduce initial bundle size
// These components are loaded on-demand when actually needed

const SemanticSearch = lazy(() => import('./semantic-search'))
const SecurityGuide = lazy(() => import('./security-guide').then(module => ({
  default: module.SecurityGuide
})))
const SecurityScanner = lazy(() => import('./security-scanner').then(module => ({
  default: module.SecurityScanner
})))
const SessionsList = lazy(() => import('./sessions-list'))

// Enhanced loading components with specific styling for each component type
const SearchLoader = () => (
  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="text-center">
      <Search className="h-8 w-8 mx-auto mb-3 text-blue-500 dark:text-blue-400 animate-bounce" />
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mx-auto"></div>
    </div>
  </div>
)

const SecurityLoader = () => (
  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="text-center">
      <Shield className="h-8 w-8 mx-auto mb-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded mx-auto"></div>
    </div>
  </div>
)

const SessionsLoader = () => (
  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="text-center">
      <div className="h-6 w-6 mx-auto mb-3 bg-gray-300 dark:bg-gray-600 rounded animate-bounce"></div>
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mx-auto"></div>
    </div>
  </div>
)

// Wrapper components with enhanced suspense fallbacks
export const LazySemanticSearch = (props: any) => (
  <Suspense fallback={<SearchLoader />}>
    <SemanticSearch {...props} />
  </Suspense>
)

export const LazySecurityGuide = (props: any) => (
  <Suspense fallback={<SecurityLoader />}>
    <SecurityGuide {...props} />
  </Suspense>
)

export const LazySecurityScanner = (props: any) => (
  <Suspense fallback={<SecurityLoader />}>
    <SecurityScanner {...props} />
  </Suspense>
)

export const LazySessionsList = (props: any) => (
  <Suspense fallback={<SessionsLoader />}>
    <SessionsList {...props} />
  </Suspense>
)

// Component size tracking for monitoring bundle optimization
export const COMPONENT_SIZES = {
  'semantic-search': 421,      // lines of code
  'security-guide': 415,
  'security-scanner': 354,
  'sessions-list': 400,
} as const

// Performance monitoring hook
export const useBundleOptimization = () => {
  const trackComponentLoad = (componentName: keyof typeof COMPONENT_SIZES) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle Optimization] Lazy loaded: ${componentName} (${COMPONENT_SIZES[componentName]} lines)`)
    }
  }

  return { trackComponentLoad }
}