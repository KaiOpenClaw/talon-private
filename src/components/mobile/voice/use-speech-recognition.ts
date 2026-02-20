/**
 * Custom hook for speech recognition logic and state management
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { logApiError } from '@/lib/logger'
import { useDeviceOptimizations } from '../mobile-optimized-layout'
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent, RecordingState } from './voice-types'

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string) => void
  onComplete: (text: string) => void
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

export function useSpeechRecognition({
  onTranscript,
  onComplete,
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1
}: UseSpeechRecognitionOptions) {
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

  return {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening
  }
}