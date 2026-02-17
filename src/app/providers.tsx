'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider, NetworkStatusMonitor } from '@/components/error-toast'
import { CommandPaletteProvider } from '@/components/command-palette'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary componentName="Application">
      <ToastProvider maxToasts={5}>
        <CommandPaletteProvider>
          <NetworkStatusMonitor />
          {children}
        </CommandPaletteProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
