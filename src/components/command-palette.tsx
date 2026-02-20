/**
 * Command Palette - Refactored Version
 * Searchable command interface with keyboard shortcuts
 */
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, Command, CornerDownLeft } from 'lucide-react'
import { CommandPaletteProps, CommandGroupedData } from './command-palette-types'
import { useCommandData } from './command-palette-data'
import { useCommandPaletteKeyboard } from './command-palette-keyboard'
import { CommandRow } from './command-row'

export function CommandPalette({ agents = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Get command data
  const commands = useCommandData(agents)

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const searchTerms = query.toLowerCase().split(' ')
    return commands.filter(cmd => {
      const searchText = [
        cmd.title,
        cmd.description || '',
        ...(cmd.keywords || []),
      ].join(' ').toLowerCase()

      return searchTerms.every(term => searchText.includes(term))
    })
  }, [commands, query])

  // Group commands by category
  const groupedCommands: CommandGroupedData = useMemo(() => {
    const groups: CommandGroupedData = {
      navigation: [],
      agents: [],
      actions: [],
    }
    
    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd)
      }
    })

    return groups
  }, [filteredCommands])

  // Keyboard handling
  const { handlePaletteKeyDown } = useCommandPaletteKeyboard(
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    filteredCommands
  )

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const executeCommand = useCallback((cmd: any) => {
    cmd.action()
    setIsOpen(false)
  }, [])

  // Render trigger button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
        title="Command palette (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-zinc-700/50 rounded text-zinc-500">
          <Command className="w-2.5 h-2.5" />
          K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="fixed inset-x-4 top-[20vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50">
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <Search className="w-5 h-5 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handlePaletteKeyDown}
              placeholder="Search commands, agents, pages..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-500 border border-zinc-700">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">
                No commands found for "{query}"
              </div>
            ) : (
              <>
                {/* Navigation */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Navigation
                    </div>
                    {groupedCommands.navigation.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Agents */}
                {groupedCommands.agents.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Agents ({groupedCommands.agents.length})
                    </div>
                    {groupedCommands.agents.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Actions */}
                {groupedCommands.actions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </div>
                    {groupedCommands.actions.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => executeCommand(cmd)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
                select
              </span>
            </div>
            <span className="text-amber-500/60">⌘K anywhere</span>
          </div>
        </div>
      </div>
    </>
  )
}

// Re-export provider for convenience
export { CommandPaletteProvider } from './command-palette-provider'