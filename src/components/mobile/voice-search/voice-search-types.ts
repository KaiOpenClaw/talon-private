/**
 * Voice Search TypeScript Definitions
 * Centralized types for speech recognition components
 */

export interface VoiceSearchProps {
  onTranscript: (text: string) => void
  onComplete: (text: string) => void
  className?: string
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  placeholder?: string
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

export interface SpeechRecognitionErrorEvent extends Event {
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

export type RecordingState = 'idle' | 'listening' | 'processing' | 'error'

export interface VoiceSearchState {
  isSupported: boolean
  state: RecordingState
  transcript: string
  interimTranscript: string
  error: string | null
}