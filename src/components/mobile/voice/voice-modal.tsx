/**
 * Voice search modal overlay component
 */

'use client'

import { X } from 'lucide-react'
import { TouchableButton } from '../touch-feedback'
import { VoiceSearch } from './voice-search-main'

interface VoiceModalProps {
  onClose: () => void
  onTranscript: (text: string) => void
  onComplete: (text: string) => void
}

export function VoiceModal({ 
  onClose, 
  onTranscript, 
  onComplete 
}: VoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-surface-0/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-1 rounded-xl p-6 w-full max-w-sm border border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-primary">Voice Search</h3>
          <TouchableButton
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-secondary hover:text-ink-primary"
            hapticFeedback="light"
            aria-label="Close voice search"
          >
            <X className="w-4 h-4" />
          </TouchableButton>
        </div>
        
        <VoiceSearch
          onTranscript={onTranscript}
          onComplete={onComplete}
          placeholder="Tap the microphone and speak..."
          interimResults={true}
        />
      </div>
    </div>
  )
}