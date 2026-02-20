/**
 * Command Row Component
 * Individual command item in the command palette
 */
import { ArrowRight } from 'lucide-react'
import { CommandRowProps } from './command-palette-types'

export function CommandRow({ command, isSelected, onClick }: CommandRowProps) {
  return (
    <button
      data-selected={isSelected}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
        ${isSelected 
          ? 'bg-amber-500/20 text-amber-200' 
          : 'text-zinc-300 hover:bg-zinc-800'
        }
      `}
    >
      <span className={isSelected ? 'text-amber-400' : 'text-zinc-500'}>
        {command.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{command.title}</div>
        {command.description && (
          <div className="text-xs text-zinc-500 truncate">{command.description}</div>
        )}
      </div>
      {isSelected && (
        <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
      )}
    </button>
  )
}