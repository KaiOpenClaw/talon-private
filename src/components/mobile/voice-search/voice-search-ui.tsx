/**
 * Voice Search UI Components
 * Visual interface components for voice search functionality
 */

'use client'

import { Mic, MicOff, Square, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchableButton } from '../touch-feedback'
import type { RecordingState } from './voice-search-types'

interface VoiceSearchButtonProps {
  state: RecordingState
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  onCancel: () => void
  className?: string
}

export function VoiceSearchButton({
  state,
  isSupported,
  onStart,
  onStop,
  onCancel,
  className
}: VoiceSearchButtonProps) {
  if (!isSupported) {
    return (
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed",
        className
      )}>
        <MicOff className="w-5 h-5" />
      </div>
    )
  }

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />
      case 'error':
        return <X className="w-5 h-5 text-red-500" />
      default:
        return <Mic className="w-5 h-5" />
    }
  }

  const getButtonProps = () => {
    switch (state) {
      case 'listening':
        return {
          onClick: onStop,
          className: cn(
            "bg-red-500 text-white animate-pulse",
            "shadow-lg shadow-red-200 dark:shadow-red-900/30",
            className
          ),
          'aria-label': 'Stop recording'
        }
      case 'processing':
        return {
          onClick: onCancel,
          className: cn(
            "bg-blue-500 text-white cursor-wait",
            "shadow-lg shadow-blue-200 dark:shadow-blue-900/30",
            className
          ),
          'aria-label': 'Processing speech...'
        }
      case 'error':
        return {
          onClick: onStart,
          className: cn(
            "bg-gray-500 text-white",
            "shadow-lg shadow-gray-200 dark:shadow-gray-900/30",
            className
          ),
          'aria-label': 'Retry voice search'
        }
      default:
        return {
          onClick: onStart,
          className: cn(
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "shadow-lg shadow-primary/20",
            className
          ),
          'aria-label': 'Start voice search'
        }
    }
  }

  const buttonProps = getButtonProps()

  return (
    <TouchableButton
      {...buttonProps}
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        buttonProps.className
      )}
    >
      {getIcon()}
    </TouchableButton>
  )
}

interface VoiceSearchTranscriptProps {
  transcript: string
  interimTranscript: string
  state: RecordingState
  placeholder?: string
  className?: string
}

export function VoiceSearchTranscript({
  transcript,
  interimTranscript,
  state,
  placeholder = "Tap to speak...",
  className
}: VoiceSearchTranscriptProps) {
  const hasTranscript = transcript || interimTranscript

  return (
    <div className={cn(
      "min-h-[2.5rem] p-3 rounded-lg border",
      "bg-background text-foreground",
      "transition-all duration-200",
      hasTranscript ? "border-primary/20" : "border-border",
      className
    )}>
      {hasTranscript ? (
        <div className="space-y-1">
          {transcript && (
            <span className="text-foreground font-medium">
              {transcript}
            </span>
          )}
          {interimTranscript && (
            <span className="text-muted-foreground italic opacity-70">
              {interimTranscript}
            </span>
          )}
        </div>
      ) : (
        <span className={cn(
          "text-muted-foreground text-sm",
          state === 'listening' && "text-primary animate-pulse"
        )}>
          {state === 'listening' ? 'Listening...' : placeholder}
        </span>
      )}
    </div>
  )
}

interface VoiceSearchStatusProps {
  state: RecordingState
  error?: string | null
  className?: string
}

export function VoiceSearchStatus({
  state,
  error,
  className
}: VoiceSearchStatusProps) {
  if (state === 'idle' && !error) return null

  const getStatusContent = () => {
    switch (state) {
      case 'listening':
        return {
          text: 'Listening...',
          className: 'text-blue-600 dark:text-blue-400',
          icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        }
      case 'processing':
        return {
          text: 'Processing...',
          className: 'text-yellow-600 dark:text-yellow-400',
          icon: <Loader2 className="w-4 h-4 animate-spin" />
        }
      case 'error':
        return {
          text: error || 'An error occurred',
          className: 'text-red-600 dark:text-red-400',
          icon: <X className="w-4 h-4" />
        }
      default:
        return null
    }
  }

  const status = getStatusContent()
  if (!status) return null

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md",
      "bg-muted/50 border border-border/50",
      "text-sm font-medium",
      status.className,
      className
    )}>
      {status.icon}
      <span>{status.text}</span>
    </div>
  )
}

interface VoiceSearchControlsProps {
  state: RecordingState
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  onCancel: () => void
  onClear: () => void
  hasTranscript: boolean
  className?: string
}

export function VoiceSearchControls({
  state,
  isSupported,
  onStart,
  onStop,
  onCancel,
  onClear,
  hasTranscript,
  className
}: VoiceSearchControlsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <VoiceSearchButton
        state={state}
        isSupported={isSupported}
        onStart={onStart}
        onStop={onStop}
        onCancel={onCancel}
      />
      
      {hasTranscript && state === 'idle' && (
        <TouchableButton
          onClick={onClear}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
          aria-label="Clear transcript"
        >
          <X className="w-4 h-4" />
        </TouchableButton>
      )}
    </div>
  )
}