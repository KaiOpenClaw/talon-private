'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider, NetworkStatusMonitor } from '@/components/error-toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary componentName="Application">
      <ToastProvider maxToasts={5}>
        <NetworkStatusMonitor />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}
