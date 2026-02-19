'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSafeApiCall, useComponentError } from '@/hooks/useSafeApiCall';
import { logger } from '@/lib/logger';

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: 'idle' | 'running' | 'ok' | 'error' | 'disabled';
  target: 'main' | 'isolated';
  agent: string;
  frequency?: string;
  description?: string;
  errorMessage?: string;
}

export function useCron() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  // Error handling hooks
  const safeApiCall = useSafeApiCall();
  const { handleError } = useComponentError('useCron');

  // Utility functions
  const getFrequencyCategory = (schedule: string): string => {
    if (schedule.includes('every')) {
      if (schedule.includes('minute')) return 'minutes';
      if (schedule.includes('hour')) return 'hourly';
      if (schedule.includes('day')) return 'daily';
    }
    if (schedule.includes('/')) return 'cron';
    return 'other';
  };

  const parseNextRun = (nextRun: string): string => {
    try {
      const date = new Date(nextRun);
      if (isNaN(date.getTime())) return nextRun;
      
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      
      if (diff < 0) return 'Overdue';
      if (diff < 60000) return 'In < 1 minute';
      if (diff < 3600000) return `In ${Math.round(diff / 60000)} minutes`;
      if (diff < 86400000) return `In ${Math.round(diff / 3600000)} hours`;
      return `In ${Math.round(diff / 86400000)} days`;
    } catch {
      return nextRun;
    }
  };

  const parseLastRun = (lastRun: string): string => {
    if (!lastRun || lastRun === 'never') return 'Never';
    try {
      const date = new Date(lastRun);
      if (isNaN(date.getTime())) return lastRun;
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.round(diff / 60000)} minutes ago`;
      if (diff < 86400000) return `${Math.round(diff / 3600000)} hours ago`;
      return `${Math.round(diff / 86400000)} days ago`;
    } catch {
      return lastRun;
    }
  };

  // Filter jobs for display
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filter === 'all' || job.status === filter;
    const matchesSearch = searchTerm === '' || 
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrequency = frequencyFilter === 'all' || 
      getFrequencyCategory(job.schedule) === frequencyFilter;
    
    return matchesStatus && matchesSearch && matchesFrequency;
  });

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await safeApiCall(
      async () => {
        const response = await fetch('/api/cron');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      {
        errorMessage: 'Failed to load cron jobs',
        component: 'useCron'
      }
    );
    
    if (result.isSuccess) {
      setJobs(result.data.jobs || []);
      setError(null);
    } else {
      setError(result.error);
      setJobs([]); // Clear jobs on error
    }
    
    setLoading(false);
  }, [safeApiCall]);

  // Run job
  const runJob = useCallback(async (jobId: string) => {
    const result = await safeApiCall(
      async () => {
        const response = await fetch('/api/cron/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      {
        errorMessage: 'Failed to run job',
        component: 'useCron'
      }
    );
    
    if (result.isSuccess) {
      // Refresh jobs list to get updated status
      await fetchJobs();
    }
    
    return result;
  }, [safeApiCall, fetchJobs]);

  // Toggle job (enable/disable)
  const toggleJob = useCallback(async (jobId: string, enable: boolean) => {
    const result = await safeApiCall(
      async () => {
        const response = await fetch('/api/cron/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, enable })
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      {
        errorMessage: `Failed to ${enable ? 'enable' : 'disable'} job`,
        component: 'useCron'
      }
    );
    
    if (result.isSuccess) {
      // Refresh jobs list to get updated status
      await fetchJobs();
    }
    
    return result;
  }, [safeApiCall, fetchJobs]);

  // Statistics
  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    idle: jobs.filter(j => j.status === 'idle').length,
    ok: jobs.filter(j => j.status === 'ok').length,
    error: jobs.filter(j => j.status === 'error').length,
    disabled: jobs.filter(j => j.status === 'disabled').length
  };

  // Initialize
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return {
    // Data
    jobs,
    filteredJobs,
    loading,
    error,
    stats,
    
    // Filters
    filter,
    searchTerm,
    frequencyFilter,
    setFilter,
    setSearchTerm,
    setFrequencyFilter,
    
    // Actions
    fetchJobs,
    runJob,
    toggleJob,
    
    // Utilities
    getFrequencyCategory,
    parseNextRun,
    parseLastRun
  };
}