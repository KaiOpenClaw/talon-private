'use client';

import React from 'react';
import { InlineErrorBoundary } from '@/components/error-boundary';
import { ErrorState, NetworkErrorState } from '@/components/error-state';
import { useCron } from '@/hooks/use-cron';
import CronStats from '@/components/cron/cron-stats';
import CronFilters from '@/components/cron/cron-filters';
import CronJobsList from '@/components/cron/cron-jobs-list';

export function CronDashboard() {
  const {
    filteredJobs,
    loading,
    error,
    stats,
    filter,
    searchTerm,
    frequencyFilter,
    setFilter,
    setSearchTerm,
    setFrequencyFilter,
    fetchJobs,
    runJob,
    toggleJob,
    parseNextRun,
    parseLastRun,
    getFrequencyCategory
  } = useCron();

  // Handle errors
  if (error) {
    return (
      <div className="space-y-4">
        <NetworkErrorState
          error={error}
          onRetry={fetchJobs}
          context="cron jobs dashboard"
        />
      </div>
    );
  }

  return (
    <InlineErrorBoundary>
      <div className="space-y-6 p-6">
        {/* Stats Overview */}
        <CronStats stats={stats} loading={loading} />

        {/* Filters */}
        <CronFilters
          filter={filter}
          searchTerm={searchTerm}
          frequencyFilter={frequencyFilter}
          setFilter={setFilter}
          setSearchTerm={setSearchTerm}
          setFrequencyFilter={setFrequencyFilter}
          onRefresh={fetchJobs}
          loading={loading}
        />

        {/* Jobs List */}
        <CronJobsList
          jobs={filteredJobs}
          onRun={runJob}
          onToggle={toggleJob}
          parseNextRun={parseNextRun}
          parseLastRun={parseLastRun}
          getFrequencyCategory={getFrequencyCategory}
        />
      </div>
    </InlineErrorBoundary>
  );
}