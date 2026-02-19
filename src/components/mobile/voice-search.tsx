/**
 * Voice Search Component for Mobile Devices
 * Provides speech-to-text functionality for mobile search interfaces
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Square, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from './mobile-optimized-layout'
import { TouchButton } from './touch-feedback'
import { useToast } from '@/hooks/use-toast'
import { logApiError } from '@/lib/logger'

interface VoiceSearchProps {
  onTranscript: (text: string) => void
  onComplete: (text: string) => void
  className?: string
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  placeholder?: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

// Extend window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void
    addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void
    addEventListener(type: 'start' | 'end' | 'soundstart' | 'soundend' | 'speechstart' | 'speechend', listener: () => void): void
  }
  
  var SpeechRecognition: {
    prototype: SpeechRecognition
    new(): SpeechRecognition
  }
  
  var webkitSpeechRecognition: {
    prototype: SpeechRecognition
    new(): SpeechRecognition
  }
}

type RecordingState = 'idle' | 'listening' | 'processing' | 'error'

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
  const [isSupported, setIsSupported] = useState(false)
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const device = useDeviceOptimizations()
  const { toast } = useToast()

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
    } else {
      setIsSupported(false)
    }
  }, [])

  // Setup speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return

    const recognition = recognitionRef.current
    
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    recognition.maxAlternatives = maxAlternatives

    recognition.addEventListener('start', () => {
      setState('listening')
      setError(null)
      setTranscript('')
      setInterimTranscript('')
    })

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
        onTranscript(finalTranscript)
      }

      if (interim) {
        setInterimTranscript(interim)
      }
    })

    recognition.addEventListener('end', () => {
      setState('idle')
      const finalText = transcript + interimTranscript
      if (finalText.trim()) {
        onComplete(finalText.trim())
      }
      setInterimTranscript('')
    })

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      setState('error')
      setError(event.error)
      
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not available.',
        'not-allowed': 'Microphone access denied.',
        'network': 'Network error occurred.',
        'service-not-allowed': 'Speech recognition service not available.'
      }

      const errorMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`
      
      toast({
        title: "Voice Search Error",
        description: errorMessage,
        variant: "destructive"
      })
    })

    recognition.addEventListener('soundstart', () => {
      setState('processing')
    })

    recognition.addEventListener('soundend', () => {
      setState('listening')
    })

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [continuous, interimResults, language, maxAlternatives, onTranscript, onComplete, transcript, interimTranscript, toast])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state !== 'idle') return

    try {
      recognitionRef.current.start()
      
      // Provide haptic feedback on mobile
      if (device.isTouch && 'vibrate' in navigator) {
        navigator.vibrate?.(50)
      }
    } catch (error) {
      logApiError(error, { 
        component: 'VoiceSearch', 
        action: 'startRecognition',
        isListening: false
      })
      setState('error')
      setError('Failed to start voice recognition')
    }
  }, [state, device.isTouch])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || state === 'idle') return

    recognitionRef.current.stop()
    
    // Provide haptic feedback on mobile
    if (device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(25)
    }
  }, [state, device.isTouch])

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

  const isActive = state === 'listening' || state === 'processing'
  const isDisabled = !isSupported || state === 'processing'

  if (!isSupported) {
    return null // Don't render anything if not supported
  }

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      {/* Voice Input Button */}
      <TouchButton
        onClick={isActive ? stopListening : startListening}
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
          isDisabled && "opacity-50 cursor-not-allowed"
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
      </TouchButton>

      {/* Status Text */}
      <div className="text-center min-h-[1.5rem]">
        <p className={cn(
          "text-sm transition-colors duration-200",
          state === 'error' ? "text-red-400" : "text-ink-secondary"
        )}>
          {getStatusText()}
        </p>
      </div>

      {/* Live Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="w-full max-w-sm mx-auto">
          <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
            <p className="text-sm text-ink-primary">
              <span className="font-medium">{transcript}</span>
              <span className="text-ink-muted opacity-70">{interimTranscript}</span>
              {isActive && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Voice Search Input - Combines text input with voice search
 */
export function VoiceSearchInput({
  value,
  onChange,
  onVoiceComplete,
  placeholder = "Search or speak...",
  className,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  onVoiceComplete?: (transcript: string) => void
  placeholder?: string
  className?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [showVoice, setShowVoice] = useState(false)
  const device = useDeviceOptimizations()

  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Update input as user speaks
    onChange(value + transcript)
  }, [value, onChange])

  const handleVoiceComplete = useCallback((transcript: string) => {
    const finalText = transcript.trim()
    if (finalText) {
      onChange(finalText)
      onVoiceComplete?.(finalText)
    }
    setShowVoice(false)
  }, [onChange, onVoiceComplete])

  // Check if speech recognition is supported
  const isVoiceSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full min-h-[44px] px-4 py-3 rounded-lg border border-border-subtle",
          "bg-surface-0 text-ink-primary placeholder-ink-muted",
          "focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:border-terminal-400",
          "transition-colors duration-200",
          // Add padding for voice button
          isVoiceSupported && device.isMobile && "pr-12",
          // Prevent zoom on iOS
          device.isMobile && "text-base",
          className
        )}
        {...props}
      />
      
      {/* Voice Search Button */}
      {isVoiceSupported && device.isMobile && (
        <TouchButton
          onClick={() => setShowVoice(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors duration-200"
          hapticFeedback="light"
          aria-label="Voice search"
        >
          <Mic className="w-4 h-4" />
        </TouchButton>
      )}

      {/* Voice Search Modal */}
      {showVoice && (
        <div className="fixed inset-0 bg-surface-0/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-1 rounded-xl p-6 w-full max-w-sm border border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-primary">Voice Search</h3>
              <TouchButton
                onClick={() => setShowVoice(false)}
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-secondary hover:text-ink-primary"
                hapticFeedback="light"
                aria-label="Close voice search"
              >
                <X className="w-4 h-4" />
              </TouchButton>
            </div>
            
            <VoiceSearch
              onTranscript={handleVoiceTranscript}
              onComplete={handleVoiceComplete}
              placeholder="Tap the microphone and speak..."
              interimResults={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceSearch