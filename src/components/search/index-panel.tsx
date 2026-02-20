/**
 * Index management panel component
 */

'use client'

import { Database, X, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import type { IndexPanelProps } from './types'

export function IndexPanel({
  stats,
  indexing,
  agentFilter,
  onClose,
  onTriggerIndex
}: IndexPanelProps) {
  return (
    <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          Vector Index
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-surface-3 rounded">
          <X className="w-4 h-4 text-ink-muted" />
        </button>
      </div>
      
      {stats ? (
        <div className="space-y-4">
          {stats.status === 'unavailable' ? (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              LanceDB not available (running on Vercel?)
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <div className="bg-surface-2 rounded-lg px-4 py-2 text-center">
                  <div className="text-xl font-bold text-terminal-400">{stats.totalDocuments}</div>
                  <div className="text-xs text-ink-muted">Total Chunks</div>
                </div>
                <div className="bg-surface-2 rounded-lg px-4 py-2 text-center">
                  <div className="text-xl font-bold text-blue-400">{Object.keys(stats.byAgent || {}).length}</div>
                  <div className="text-xs text-ink-muted">Agents Indexed</div>
                </div>
              </div>
              
              {stats.byAgent && Object.keys(stats.byAgent).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(stats.byAgent).map(([agent, count]) => (
                    <span 
                      key={agent} 
                      className="px-2 py-1 bg-surface-2 rounded text-xs text-ink-secondary"
                    >
                      {agent}: {count}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => onTriggerIndex()}
                  disabled={indexing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm font-medium"
                >
                  {indexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Reindex All
                </button>
                {agentFilter && (
                  <button
                    onClick={() => onTriggerIndex(agentFilter)}
                    disabled={indexing}
                    className="px-4 py-2 bg-surface-3 hover:bg-surface-4 rounded-lg text-sm"
                  >
                    Index {agentFilter}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-terminal-500" />
        </div>
      )}
    </div>
  )
}