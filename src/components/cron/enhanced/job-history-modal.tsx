/**
 * Job History Modal Component
 * Shows execution history for a specific job
 */

import { X, Timer, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { CronJob, JobRun } from '@/lib/types/cron'
import { formatDuration } from '@/lib/utils/cron-utils'

interface JobHistoryModalProps {
  isOpen: boolean
  job: CronJob | null
  runs: JobRun[]
  loading: boolean
  onClose: () => void
}

export function JobHistoryModal({ isOpen, job, runs, loading, onClose }: JobHistoryModalProps) {
  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-2">
          <div>
            <h2 className="text-xl font-semibold text-ink-base">Execution History</h2>
            <p className="text-sm text-ink-muted">{job.name || 'Unnamed Job'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-ink-muted">Loading execution history...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-ink-muted">
              <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No execution history available</p>
            </div>
          ) : (
            <div className="space-y-3 p-6">
              {runs.map((run) => (
                <div key={run.id} className="bg-surface-2 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {run.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : run.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          run.status === 'success' ? 'text-green-400' :
                          run.status === 'error' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {new Date(run.startTime).toLocaleString()}
                        </span>
                      </div>
                      
                      {run.output && (
                        <div className="text-sm text-ink-base mb-2">{run.output}</div>
                      )}
                      
                      {run.error && (
                        <div className="text-sm text-red-400 mb-2">{run.error}</div>
                      )}
                    </div>
                    
                    <div className="text-right text-xs text-ink-muted">
                      <div>Duration: {formatDuration(run.duration)}</div>
                      {run.exitCode !== undefined && (
                        <div>Exit: {run.exitCode}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-surface-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-2 text-ink-base rounded-lg hover:bg-surface-3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}