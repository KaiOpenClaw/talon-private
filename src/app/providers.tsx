'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider, NetworkStatusMonitor } from '@/components/error-toast'
import { LazyCommandPaletteProvider } from '@/components/lazy-command-palette-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { PushNotificationSetup } from '@/components/push-notifications'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary componentName="Application">
      <ToastProvider maxToasts={5}>
        <LazyCommandPaletteProvider>
          <NetworkStatusMonitor />
          <PWAInstallPrompt />
          <PushNotificationSetup />
          {children}
        </LazyCommandPaletteProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
