/**
 * Voice Search Component Exports
 * Clean exports for all voice search functionality
 */

export { VoiceSearchMain as VoiceSearch } from './voice-search-main'
export { useVoiceSearch } from './use-voice-search'
export { 
  VoiceSearchButton, 
  VoiceSearchTranscript, 
  VoiceSearchStatus, 
  VoiceSearchControls 
} from './voice-search-ui'
export type { 
  VoiceSearchProps, 
  VoiceSearchState, 
  RecordingState,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from './voice-search-types'