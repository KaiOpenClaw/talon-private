/**
 * TypeScript interfaces and types for Cron job management
 * Extracted from schedule/enhanced/page.tsx for better maintainability
 */

export interface CronJob {
  id: string
  name?: string
  schedule: {
    kind: 'at' | 'every' | 'cron'
    expr?: string
    at?: string
    everyMs?: number
    tz?: string
  }
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
    model?: string
    timeoutSeconds?: number
  }
  sessionTarget?: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status?: string
  agent?: string
  errorMessage?: string
}

export interface JobRun {
  id: string
  jobId: string
  startTime: string
  endTime?: string
  status: 'success' | 'error' | 'running'
  exitCode?: number
  duration?: number
  output?: string
  error?: string
}

export interface CreateJobData {
  name: string
  scheduleType: 'cron' | 'every' | 'at'
  cronExpression: string
  intervalMs: number
  scheduledAt: string
  payloadType: 'systemEvent' | 'agentTurn'
  message: string
  sessionTarget: 'main' | 'isolated'
  enabled: boolean
  notify: boolean
}

export type ScheduleType = 'cron' | 'every' | 'at'
export type PayloadType = 'systemEvent' | 'agentTurn'  
export type SessionTarget = 'main' | 'isolated'

export interface CronValidation {
  valid: boolean
  error?: string
  nextRuns?: string[]
}

export interface CronStats {
  totalJobs: number
  enabledJobs: number
  recentRuns: number
  successRate: number
  nextUpcoming: CronJob[]
}

export const INITIAL_JOB_DATA: CreateJobData = {
  name: '',
  scheduleType: 'every',
  cronExpression: '0 0 * * *',
  intervalMs: 3600000, // 1 hour
  scheduledAt: '',
  payloadType: 'agentTurn',
  message: '',
  sessionTarget: 'isolated',
  enabled: true,
  notify: false
}