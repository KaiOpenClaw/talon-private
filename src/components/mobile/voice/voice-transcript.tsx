/**
 * Voice transcript display component
 */

'use client'

import { cn } from '@/lib/utils'
import type { RecordingState } from './voice-types'

interface VoiceTranscriptProps {
  transcript: string
  interimTranscript: string
  state: RecordingState
  className?: string
}

export function VoiceTranscript({ 
  transcript, 
  interimTranscript, 
  state,
  className 
}: VoiceTranscriptProps) {
  const isActive = state === 'listening' || state === 'processing'
  
  if (!transcript && !interimTranscript) {
    return null
  }

  return (
    <div className={cn("w-full max-w-sm mx-auto", className)}>
      <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
        <p className="text-sm text-ink-primary">
          <span className="font-medium">{transcript}</span>
          <span className="text-ink-muted opacity-70">{interimTranscript}</span>
          {isActive && <span className="animate-pulse ml-1">|</span>}
        </p>
      </div>
    </div>
  )
}