/**
 * Gesture Utilities Hook
 * Hook for managing active gestures
 */
import { useState, useCallback } from 'react'

export function useGestures() {
  const [activeGestures, setActiveGestures] = useState<string[]>([])

  const addGesture = useCallback((gesture: string) => {
    setActiveGestures(prev => [...prev, gesture])
  }, [])

  const removeGesture = useCallback((gesture: string) => {
    setActiveGestures(prev => prev.filter(g => g !== gesture))
  }, [])

  return {
    activeGestures,
    addGesture,
    removeGesture,
    hasActiveGesture: activeGestures.length > 0
  }
}