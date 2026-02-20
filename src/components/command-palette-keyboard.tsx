/**
 * Command Palette Keyboard Handling
 * Manages keyboard shortcuts and navigation
 */
import { useEffect, useCallback } from 'react'
import { CommandItem } from './command-palette-types'

export function useCommandPaletteKeyboard(
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  filteredCommands: CommandItem[]
) {
  // Global keyboard handler for opening palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  // Keyboard navigation within palette
  const handlePaletteKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(Math.min(selectedIndex + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(Math.max(selectedIndex - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          setIsOpen(false)
        }
        break
    }
  }, [filteredCommands, selectedIndex, setSelectedIndex, setIsOpen])

  return { handlePaletteKeyDown }
}