/**
 * Job Details Modal Component
 * Shows detailed information for a specific job
 */

import { X, Clock, Zap, Settings, AlertTriangle } from 'lucide-react'
import { CronJob } from '@/lib/types/cron'
import { formatSchedule, formatRelativeTime } from '@/lib/utils/cron-utils'

interface JobDetailsModalProps {
  isOpen: boolean
  job: CronJob | null
  onClose: () => void
}

export function JobDetailsModal({ isOpen, job, onClose }: JobDetailsModalProps) {
  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-2">
          <div>
            <h2 className="text-xl font-semibold text-ink-base">Job Details</h2>
            <p className="text-sm text-ink-muted">{job.name || 'Unnamed Job'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <h3 className="font-medium text-ink-base mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">State:</span>
                <span className={`text-sm font-medium ${job.enabled ? 'text-green-400' : 'text-ink-muted'}`}>
                  {job.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Status:</span>
                <span className={`text-sm font-medium ${
                  job.status === 'error' ? 'text-red-400' : 
                  job.status === 'running' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {job.status || 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Last Run:</span>
                <span className="text-sm text-ink-base">{formatRelativeTime(job.lastRun)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Next Run:</span>
                <span className="text-sm text-ink-base">{formatRelativeTime(job.nextRun)}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="font-medium text-ink-base mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Type:</span>
                <span className="text-sm text-ink-base">{job.schedule.kind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Expression:</span>
                <span className="text-sm text-ink-base font-mono">{formatSchedule(job.schedule)}</span>
              </div>
              {job.schedule.tz && (
                <div className="flex justify-between">
                  <span className="text-sm text-ink-muted">Timezone:</span>
                  <span className="text-sm text-ink-base">{job.schedule.tz}</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="font-medium text-ink-base mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">ID:</span>
                <span className="text-sm text-ink-base font-mono text-xs">{job.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Type:</span>
                <span className="text-sm text-ink-base">{job.payload.kind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink-muted">Target:</span>
                <span className="text-sm text-ink-base">{job.sessionTarget || 'main'}</span>
              </div>
              {job.agent && (
                <div className="flex justify-between">
                  <span className="text-sm text-ink-muted">Agent:</span>
                  <span className="text-sm text-ink-base">{job.agent}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="font-medium text-ink-base mb-2">Message</h3>
            <div className="p-3 bg-surface-2 rounded text-sm text-ink-base">
              {job.payload.kind === 'systemEvent' ? job.payload.text : job.payload.message}
            </div>
          </div>

          {/* Error */}
          {job.errorMessage && (
            <div>
              <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error
              </h3>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                {job.errorMessage}
              </div>
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