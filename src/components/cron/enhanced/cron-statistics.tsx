/**
 * Cron Statistics Dashboard Component
 * Displays job statistics and health metrics
 */

import { BarChart3, TrendingUp, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { CronJob } from '@/lib/types/cron'
import { formatRelativeTime } from '@/lib/utils/cron-utils'

interface CronStatisticsProps {
  jobs: CronJob[]
  loading?: boolean
}

export function CronStatistics({ jobs, loading }: CronStatisticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-1 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-surface-2 rounded w-3/4 mb-2" />
              <div className="h-8 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const totalJobs = jobs.length
  const enabledJobs = jobs.filter(job => job.enabled).length
  const jobsWithErrors = jobs.filter(job => job.errorMessage || job.status === 'error').length
  const successRate = totalJobs > 0 ? ((enabledJobs - jobsWithErrors) / enabledJobs * 100) : 0

  const upcomingJobs = jobs
    .filter(job => job.enabled && job.nextRun)
    .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-1 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm text-ink-muted">Total Jobs</span>
          </div>
          <div className="text-2xl font-bold text-ink-base">{totalJobs}</div>
        </div>

        <div className="bg-surface-1 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-ink-muted">Active Jobs</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{enabledJobs}</div>
        </div>

        <div className="bg-surface-1 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-ink-muted">Errors</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{jobsWithErrors}</div>
        </div>

        <div className="bg-surface-1 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-ink-muted">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{successRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Upcoming Jobs */}
      {upcomingJobs.length > 0 && (
        <div className="bg-surface-1 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-ink-base">Upcoming Jobs</h3>
          </div>
          <div className="space-y-3">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="font-medium text-ink-base">{job.name || 'Unnamed Job'}</div>
                    <div className="text-sm text-ink-muted">
                      {job.payload.kind === 'systemEvent' ? job.payload.text : job.payload.message}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-400">
                    {formatRelativeTime(job.nextRun)}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {new Date(job.nextRun!).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}