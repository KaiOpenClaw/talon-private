/**
 * Cron Job List Component
 * Displays and manages individual cron jobs
 */

import { useState } from 'react'
import { Play, Pause, Edit3, Trash2, History, Eye, Clock, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { CronJob } from '@/lib/types/cron'
import { formatSchedule, formatRelativeTime, getJobStatusColor, getJobStatusIcon } from '@/lib/utils/cron-utils'

interface CronJobListProps {
  jobs: CronJob[]
  loading?: boolean
  runningJob?: string | null
  onRunJob: (jobId: string) => Promise<void>
  onToggleJob: (jobId: string, enabled: boolean) => Promise<void>
  onEditJob: (job: CronJob) => void
  onDeleteJob: (jobId: string) => Promise<void>
  onViewHistory: (job: CronJob) => void
  onViewDetails: (job: CronJob) => void
}

function JobStatusIcon({ job }: { job: CronJob }) {
  const status = getJobStatusIcon(job)
  
  switch (status) {
    case 'success':
      return <Zap className="w-4 h-4 text-green-400" />
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-400" />
    case 'running':
      return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
    case 'disabled':
      return <Pause className="w-4 h-4 text-ink-muted" />
    default:
      return <Clock className="w-4 h-4 text-ink-muted" />
  }
}

function JobCard({ job, runningJob, onRunJob, onToggleJob, onEditJob, onDeleteJob, onViewHistory, onViewDetails }: {
  job: CronJob
  runningJob?: string | null
  onRunJob: (jobId: string) => Promise<void>
  onToggleJob: (jobId: string, enabled: boolean) => Promise<void>
  onEditJob: (job: CronJob) => void
  onDeleteJob: (jobId: string) => Promise<void>
  onViewHistory: (job: CronJob) => void
  onViewDetails: (job: CronJob) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${job.name || 'this job'}"?`)) return
    setIsDeleting(true)
    try {
      await onDeleteJob(job.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await onToggleJob(job.id, !job.enabled)
    } finally {
      setIsToggling(false)
    }
  }

  const handleRun = async () => {
    try {
      await onRunJob(job.id)
    } catch (e) {
      // Error handling is done in the parent component
    }
  }

  return (
    <div className={`bg-surface-1 rounded-lg p-4 border-l-4 ${
      job.enabled ? (job.errorMessage ? 'border-red-400' : 'border-green-400') : 'border-ink-muted'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <JobStatusIcon job={job} />
            <h3 className="font-semibold text-ink-base">{job.name || 'Unnamed Job'}</h3>
            {job.agent && (
              <span className="px-2 py-1 bg-surface-2 rounded text-xs text-ink-muted">
                {job.agent}
              </span>
            )}
          </div>
          
          <div className="space-y-1 mb-3">
            <div className="text-sm text-ink-muted">
              <span className="font-medium">Schedule:</span> {formatSchedule(job.schedule)}
            </div>
            <div className="text-sm text-ink-muted">
              <span className="font-medium">Message:</span>{' '}
              {job.payload.kind === 'systemEvent' ? job.payload.text : job.payload.message}
            </div>
            <div className="text-sm text-ink-muted">
              <span className="font-medium">Target:</span> {job.sessionTarget || 'main'}
            </div>
          </div>

          {job.errorMessage && (
            <div className="text-sm text-red-400 mb-3 p-2 bg-red-500/10 rounded">
              {job.errorMessage}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <div>Last: {formatRelativeTime(job.lastRun)}</div>
            <div>Next: {formatRelativeTime(job.nextRun)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleRun}
            disabled={runningJob === job.id || !job.enabled}
            className="p-2 text-ink-muted hover:text-green-400 hover:bg-surface-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run now"
          >
            {runningJob === job.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`p-2 rounded transition-colors ${
              job.enabled 
                ? 'text-green-400 hover:text-red-400 hover:bg-surface-2' 
                : 'text-ink-muted hover:text-green-400 hover:bg-surface-2'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={job.enabled ? 'Disable job' : 'Enable job'}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : job.enabled ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onEditJob(job)}
            className="p-2 text-ink-muted hover:text-blue-400 hover:bg-surface-2 rounded transition-colors"
            title="Edit job"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewHistory(job)}
            className="p-2 text-ink-muted hover:text-purple-400 hover:bg-surface-2 rounded transition-colors"
            title="View execution history"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(job)}
            className="p-2 text-ink-muted hover:text-blue-400 hover:bg-surface-2 rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-ink-muted hover:text-red-400 hover:bg-surface-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete job"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CronJobList({
  jobs,
  loading,
  runningJob,
  onRunJob,
  onToggleJob,
  onEditJob,
  onDeleteJob,
  onViewHistory,
  onViewDetails
}: CronJobListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface-1 rounded-lg p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-surface-2 rounded w-1/2" />
              <div className="h-3 bg-surface-2 rounded w-3/4" />
              <div className="h-3 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-4 text-ink-muted opacity-50" />
        <h3 className="text-lg font-medium text-ink-muted mb-2">No cron jobs found</h3>
        <p className="text-ink-muted">Create your first scheduled job to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          runningJob={runningJob}
          onRunJob={onRunJob}
          onToggleJob={onToggleJob}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
          onViewHistory={onViewHistory}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}