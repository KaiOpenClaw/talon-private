/**
 * Voice search status display component
 */

'use client'

import { cn } from '@/lib/utils'
import type { RecordingState } from './voice-types'

interface VoiceStatusProps {
  state: RecordingState
  error: string | null
  placeholder: string
  className?: string
}

export function VoiceStatus({ 
  state, 
  error, 
  placeholder,
  className 
}: VoiceStatusProps) {
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening...'
      case 'processing':
        return 'Processing...'
      case 'error':
        return error || 'Error occurred'
      default:
        return placeholder
    }
  }

  return (
    <div className={cn("text-center min-h-[1.5rem]", className)}>
      <p className={cn(
        "text-sm transition-colors duration-200",
        state === 'error' ? "text-red-400" : "text-ink-secondary"
      )}>
        {getStatusText()}
      </p>
    </div>
  )
}