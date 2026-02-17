/**
 * Connection Status Indicator
 * Shows WebSocket connection status in the UI
 */

'use client'

import { useWebSocket } from '@/lib/useWebSocket'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  WifiIcon, 
  WifiOffIcon, 
  RotateCcwIcon,
  AlertCircleIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  className?: string
  showLabel?: boolean
  variant?: 'badge' | 'icon' | 'full'
}

export function ConnectionStatus({ 
  className, 
  showLabel = false,
  variant = 'badge' 
}: ConnectionStatusProps) {
  const { connected, connecting, error, reconnectAttempt, connect } = useWebSocket()

  const getStatusInfo = () => {
    if (connecting) {
      return {
        status: 'connecting',
        label: 'Connecting...',
        icon: RotateCcwIcon,
        color: 'bg-yellow-500',
        badgeVariant: 'secondary' as const
      }
    }
    
    if (error) {
      return {
        status: 'error',
        label: `Connection Error${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : ''}`,
        icon: AlertCircleIcon,
        color: 'bg-red-500',
        badgeVariant: 'destructive' as const
      }
    }
    
    if (connected) {
      return {
        status: 'connected',
        label: 'Live Updates',
        icon: WifiIcon,
        color: 'bg-green-500',
        badgeVariant: 'default' as const
      }
    }
    
    return {
      status: 'disconnected',
      label: 'Disconnected',
      icon: WifiOffIcon,
      color: 'bg-gray-500',
      badgeVariant: 'secondary' as const
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  if (variant === 'icon') {
    return (
      <Tooltip
        content={
          <div>
            <p>{statusInfo.label}</p>
            {error && (
              <Button
                size="sm"
                variant="ghost"
                onClick={connect}
                className="mt-1 h-6 px-2 text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        }
      >
        <div className={cn('relative', className)}>
          <Icon className="h-4 w-4" />
          <div 
            className={cn(
              'absolute -top-1 -right-1 h-2 w-2 rounded-full',
              statusInfo.color
            )}
          />
        </div>
      </Tooltip>
    )
  }

  if (variant === 'badge') {
    return (
      <Badge 
        variant={statusInfo.badgeVariant}
        className={cn('flex items-center gap-1', className)}
      >
        <div className={cn('h-2 w-2 rounded-full', statusInfo.color)} />
        {showLabel && statusInfo.label}
      </Badge>
    )
  }

  // Full variant with retry button
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{statusInfo.label}</span>
      </div>
      
      {error && (
        <Button
          size="sm"
          variant="outline"
          onClick={connect}
          disabled={connecting}
          className="h-7 px-2"
        >
          {connecting ? (
            <RotateCcwIcon className="h-3 w-3 animate-spin" />
          ) : (
            'Retry'
          )}
        </Button>
      )}
    </div>
  )
}

// Global connection status for use in layouts
export function GlobalConnectionStatus() {
  return (
    <ConnectionStatus 
      variant="badge"
      showLabel={true}
      className="fixed bottom-4 right-4 z-50"
    />
  )
}