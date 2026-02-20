/**
 * Main voice search component - Modular Architecture
 * Split from 416-line monolith into focused, reusable components
 */

'use client'

import { cn } from '@/lib/utils'
import { VoiceButton } from './voice-button'
import { VoiceStatus } from './voice-status'
import { VoiceTranscript } from './voice-transcript'
import { useSpeechRecognition } from './use-speech-recognition'
import type { VoiceSearchProps } from './voice-types'

export function VoiceSearch({
  onTranscript,
  onComplete,
  className,
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
  placeholder = "Tap to speak..."
}: VoiceSearchProps) {
  const {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onTranscript,
    onComplete,
    language,
    continuous,
    interimResults,
    maxAlternatives
  })

  if (!isSupported) {
    return null // Don't render anything if not supported
  }

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <VoiceButton
        state={state}
        onStart={startListening}
        onStop={stopListening}
        disabled={!isSupported}
      />
      
      <VoiceStatus
        state={state}
        error={error}
        placeholder={placeholder}
      />
      
      <VoiceTranscript
        transcript={transcript}
        interimTranscript={interimTranscript}
        state={state}
      />
    </div>
  )
}