/**
 * Voice Search Custom Hook
 * Handles speech recognition logic and state management
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { logApiError } from '@/lib/logger'
import type { 
  VoiceSearchProps, 
  VoiceSearchState, 
  RecordingState, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from './voice-search-types'

interface UseVoiceSearchOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onTranscript?: (text: string) => void
  onComplete?: (text: string) => void
}

export function useVoiceSearch({
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
  onTranscript,
  onComplete
}: UseVoiceSearchOptions = {}) {
  const [isSupported, setIsSupported] = useState(false)
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { toast } = useToast()

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
    } else {
      setIsSupported(false)
      logApiError('Speech recognition not supported', { 
        userAgent: navigator.userAgent,
        component: 'useVoiceSearch'
      })
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
        onTranscript?.(finalTranscript)
      }

      if (interim) {
        setInterimTranscript(interim)
      }
    })

    recognition.addEventListener('end', () => {
      setState('idle')
      const finalText = transcript + interimTranscript
      if (finalText.trim()) {
        onComplete?.(finalText.trim())
      }
    })

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      setState('error')
      setError(event.error)
      
      logApiError('Speech recognition error', {
        error: event.error,
        message: event.message,
        component: 'useVoiceSearch'
      })

      // Show user-friendly error messages
      let errorMessage = 'Speech recognition failed'
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Try again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone access denied'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission required'
          break
        case 'network':
          errorMessage = 'Network error. Check your connection.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      toast({
        title: 'Voice Search Error',
        description: errorMessage,
        variant: 'destructive'
      })
    })

    recognition.addEventListener('soundstart', () => {
      logApiError('Voice search sound detected', { component: 'useVoiceSearch' })
    })

    recognition.addEventListener('speechstart', () => {
      setState('listening')
    })

    recognition.addEventListener('speechend', () => {
      setState('processing')
    })

  }, [language, continuous, interimResults, maxAlternatives, onTranscript, onComplete, toast, transcript])

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      toast({
        title: 'Voice Search Unavailable',
        description: 'Speech recognition is not supported in this browser',
        variant: 'destructive'
      })
      return
    }

    try {
      setState('listening')
      recognitionRef.current.start()
    } catch (error) {
      setState('error')
      setError('Failed to start recording')
      
      logApiError('Failed to start speech recognition', {
        error: error instanceof Error ? error.message : String(error),
        component: 'useVoiceSearch'
      })
      
      toast({
        title: 'Recording Error',
        description: 'Unable to start voice recording',
        variant: 'destructive'
      })
    }
  }, [isSupported, toast])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setState('processing')
    }
  }, [])

  const cancelRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      setState('idle')
      setTranscript('')
      setInterimTranscript('')
      setError(null)
    }
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript
  }
}