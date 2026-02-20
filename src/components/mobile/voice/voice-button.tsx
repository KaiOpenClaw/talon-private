/**
 * Voice recording button component
 */

'use client'

import { Mic, MicOff, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchableButton } from '../touch-feedback'
import type { RecordingState } from './voice-types'

interface VoiceButtonProps {
  state: RecordingState
  onStart: () => void
  onStop: () => void
  disabled?: boolean
  className?: string
}

export function VoiceButton({ 
  state, 
  onStart, 
  onStop, 
  disabled = false,
  className 
}: VoiceButtonProps) {
  const isActive = state === 'listening' || state === 'processing'
  const isDisabled = disabled || state === 'processing'

  const getButtonIcon = () => {
    switch (state) {
      case 'listening':
      case 'processing':
        return <MicOff className="w-5 h-5" />
      case 'error':
        return <Square className="w-5 h-5" />
      default:
        return <Mic className="w-5 h-5" />
    }
  }

  return (
    <TouchableButton
      onClick={isActive ? onStop : onStart}
      disabled={isDisabled}
      hapticFeedback="medium"
      className={cn(
        "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
        "border-2 border-dashed",
        isActive && [
          "bg-red-500/20 border-red-400 text-red-400",
          "animate-pulse"
        ],
        !isActive && state === 'idle' && [
          "bg-terminal-500/20 border-terminal-400 text-terminal-400",
          "hover:bg-terminal-500/30 hover:border-terminal-300",
          "active:bg-terminal-500/40"
        ],
        state === 'error' && [
          "bg-red-500/20 border-red-400 text-red-400"
        ],
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isActive ? "Stop listening" : "Start voice search"}
    >
      {state === 'processing' ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        getButtonIcon()
      )}
      
      {/* Pulsing ring for active state */}
      {isActive && (
        <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20" />
      )}
    </TouchableButton>
  )
}