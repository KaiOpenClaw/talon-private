'use client'

import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { logger } from '@/lib/logger'

// Lazy load the command palette only when actually opened
const CommandPalette = lazy(() => import('./command-palette').then(module => ({
  default: module.CommandPalette
})))

interface LazyCommandPaletteProviderProps {
  children: React.ReactNode
}

export function LazyCommandPaletteProvider({ children }: LazyCommandPaletteProviderProps) {
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])
  const [shouldLoad, setShouldLoad] = useState(false)

  // Fetch agents data (always needed for keyboard shortcuts)
  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAgents(data.agents || data || []))
      .catch(() => [])
  }, [])

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        event.stopPropagation()
        
        // Start loading the component if not already done
        if (!shouldLoad) {
          setShouldLoad(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shouldLoad])

  return (
    <>
      {children}
      {/* Only render command palette when it should be loaded */}
      {shouldLoad && (
        <Suspense fallback={null}>
          <CommandPalette agents={agents} />
        </Suspense>
      )}
    </>
  )
}

// Performance tracking
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  logger.debug('LazyCommandPaletteProvider initialized', {
    component: 'LazyCommandPaletteProvider',
    trigger: 'Cmd+K',
    bundleOptimization: 'Command palette lazy loaded',
    originalLines: 459
  })
}