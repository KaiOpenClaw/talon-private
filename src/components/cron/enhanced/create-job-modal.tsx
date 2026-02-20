/**
 * Create Job Modal Component
 * Modal for creating new cron jobs
 */

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { CreateJobData, INITIAL_JOB_DATA } from '@/lib/types/cron'

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: CreateJobData) => Promise<void>
}

export function CreateJobModal({ isOpen, onClose, onSubmit }: CreateJobModalProps) {
  const [jobData, setJobData] = useState<CreateJobData>(INITIAL_JOB_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(jobData)
      setJobData(INITIAL_JOB_DATA) // Reset form
    } catch (error) {
      // Error handling will be implemented
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink-base">Create New Job</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-base mb-2">
              Job Name
            </label>
            <input
              type="text"
              value={jobData.name}
              onChange={(e) => setJobData({ ...jobData, name: e.target.value })}
              className="w-full px-3 py-2 bg-surface-2 border border-surface-2 rounded-md text-ink-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter job name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-base mb-2">
              Message
            </label>
            <textarea
              value={jobData.message}
              onChange={(e) => setJobData({ ...jobData, message: e.target.value })}
              className="w-full px-3 py-2 bg-surface-2 border border-surface-2 rounded-md text-ink-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter job message"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-muted hover:text-ink-base transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}