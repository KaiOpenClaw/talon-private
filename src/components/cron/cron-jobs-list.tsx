'use client';

import React from 'react';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { CronJob } from '@/hooks/use-cron';
import CronJobCard from './cron-job-card';

interface CronJobsListProps {
  jobs: CronJob[];
  onRun: (jobId: string) => void;
  onToggle: (jobId: string, enable: boolean) => void;
  parseNextRun: (nextRun: string) => string;
  parseLastRun: (lastRun: string) => string;
  getFrequencyCategory: (schedule: string) => string;
}

export default function CronJobsList({
  jobs,
  onRun,
  onToggle,
  parseNextRun,
  parseLastRun,
  getFrequencyCategory
}: CronJobsListProps) {
  // Keyboard navigation for job list
  const {
    focusedIndex,
    handleKeyDown,
    getItemProps,
    getContainerProps
  } = useKeyboardNavigation({
    items: jobs,
    onSelect: (job, index) => {
      // Default action: run the job
      onRun(job.id);
    },
    getSearchText: (job) => job.name
  });

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No cron jobs found</h3>
        <p className="text-muted-foreground">
          No jobs match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3" 
      {...getContainerProps()}
      aria-label="Cron jobs list - Use arrow keys to navigate, Enter to run job"
    >
      <div className="text-sm text-muted-foreground mb-2">
        💡 Use ↑↓ arrows to navigate • Enter to run • Type job name to jump
      </div>
      
      {jobs.map((job, index) => {
        const itemProps = getItemProps(job, index);
        return (
          <CronJobCard
            key={job.id}
            job={job}
            index={index}
            focusedIndex={focusedIndex}
            itemProps={itemProps}
            onRun={onRun}
            onToggle={onToggle}
            parseNextRun={parseNextRun}
            parseLastRun={parseLastRun}
            getFrequencyCategory={getFrequencyCategory}
          />
        );
      })}
    </div>
  );
}