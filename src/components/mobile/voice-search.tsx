/**
 * Voice Search Component (Refactored)
 * Re-export from modular architecture
 * 
 * This file maintains backward compatibility while the implementation
 * has been split into focused modules for better build performance:
 * - voice-search/voice-search-types.ts (58 lines)
 * - voice-search/use-voice-search.ts (179 lines) 
 * - voice-search/voice-search-ui.tsx (243 lines)
 * - voice-search/voice-search-main.tsx (90 lines)
 * - voice-search/index.tsx (18 lines)
 * 
 * Total: 588 lines across 5 focused files vs 416 lines in one file
 * Benefits: Better code splitting, tree shaking, and build performance
 */

export { 
  VoiceSearch,
  useVoiceSearch,
  VoiceSearchButton,
  VoiceSearchTranscript,
  VoiceSearchStatus,
  VoiceSearchControls
} from './voice-search/'

export type { 
  VoiceSearchProps,
  VoiceSearchState,
  RecordingState,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from './voice-search/'