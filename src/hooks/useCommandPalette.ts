/**
 * Command Palette Hook
 * Provides methods to open and control the command palette
 */

'use client'

import { useCallback } from 'react'

export function useCommandPalette() {
  // Function to trigger the command palette
  const openCommandPalette = useCallback(() => {
    // Dispatch the same keyboard event that opens the command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: !navigator.userAgent.includes('Mac'),
      metaKey: navigator.userAgent.includes('Mac'),
      bubbles: true,
      cancelable: true
    })
    
    document.dispatchEvent(event)
  }, [])

  return {
    openCommandPalette
  }
}

export default useCommandPalette