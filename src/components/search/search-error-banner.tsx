/**
 * Search error banner component for connection status
 */

'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import type { SearchErrorBannerProps } from './types'

export function SearchErrorBanner({ isStale, onRetry }: SearchErrorBannerProps) {
  if (!isStale) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">
          Search may be using cached data - connection issues detected
        </span>
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors"
      >
        <RefreshCw className="h-3 w-3 mr-1 inline" />
        Retry
      </button>
    </div>
  )
}