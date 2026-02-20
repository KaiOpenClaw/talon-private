/**
 * Voice Search Main Component
 * Simplified main component using refactored modules
 */

'use client'

import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from '../mobile-optimized-layout'
import { useVoiceSearch } from './use-voice-search'
import { VoiceSearchTranscript, VoiceSearchStatus, VoiceSearchControls } from './voice-search-ui'
import type { VoiceSearchProps } from './voice-search-types'

export function VoiceSearchMain({
  onTranscript,
  onComplete,
  className,
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
  placeholder = "Tap to speak..."
}: VoiceSearchProps) {
  const device = useDeviceOptimizations()
  
  const {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript
  } = useVoiceSearch({
    language,
    continuous,
    interimResults,
    maxAlternatives,
    onTranscript,
    onComplete
  })

  const hasTranscript = Boolean(transcript || interimTranscript)

  return (
    <div className={cn(
      "space-y-4 p-4",
      "bg-background rounded-lg border border-border",
      // Responsive sizing
      device.isSmallScreen ? "max-w-sm" : "max-w-md",
      // Touch optimization for mobile
      device.hasTouch && "touch-manipulation",
      className
    )}>
      {/* Transcript Display */}
      <VoiceSearchTranscript
        transcript={transcript}
        interimTranscript={interimTranscript}
        state={state}
        placeholder={placeholder}
      />

      {/* Status Indicator */}
      <VoiceSearchStatus
        state={state}
        error={error}
      />

      {/* Control Buttons */}
      <VoiceSearchControls
        state={state}
        isSupported={isSupported}
        onStart={startRecording}
        onStop={stopRecording}
        onCancel={cancelRecording}
        onClear={clearTranscript}
        hasTranscript={hasTranscript}
        className="justify-center"
      />

      {/* Device-specific optimizations */}
      {!isSupported && (
        <div className="text-center text-sm text-muted-foreground">
          Voice search is not available in this browser.
          {device.isIOS && (
            <div className="mt-1">
              Try Safari for better speech recognition support.
            </div>
          )}
        </div>
      )}
    </div>
  )
}