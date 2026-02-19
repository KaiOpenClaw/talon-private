'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  agent?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorCount: number;
  operationsPerMinute: number;
}

export interface SystemMetrics {
  timestamp: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

export function usePerformance() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([]);
  const [recentErrors, setRecentErrors] = useState<PerformanceMetric[]>([]);
  const [slowestOps, setSlowestOps] = useState<PerformanceMetric[]>([]);
  const [timeRange, setTimeRange] = useState('10m');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch current performance stats
      const statsResponse = await fetch(`/api/performance/stats?timeRange=${timeRange}&agent=${selectedAgent}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch system metrics
      const systemResponse = await fetch('/api/performance/system');
      const systemData = await systemResponse.json();
      setSystemMetrics(systemData);
      
      // Fetch recent metrics
      const metricsResponse = await fetch(`/api/performance/metrics?limit=50&timeRange=${timeRange}&agent=${selectedAgent}`);
      const metricsData = await metricsResponse.json();
      setRecentMetrics(metricsData);
      
      // Fetch recent errors
      const errorsResponse = await fetch('/api/performance/errors?limit=10');
      const errorsData = await errorsResponse.json();
      setRecentErrors(errorsData);
      
      // Fetch slowest operations
      const slowestResponse = await fetch('/api/performance/slowest?limit=10');
      const slowestData = await slowestResponse.json();
      setSlowestOps(slowestData);
      
    } catch (error) {
      logger.error('Failed to fetch performance data', {
        component: 'usePerformance',
        action: 'fetchPerformanceData',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange, selectedAgent]);

  return {
    stats,
    systemMetrics,
    recentMetrics,
    recentErrors,
    slowestOps,
    timeRange,
    selectedAgent,
    loading,
    setTimeRange,
    setSelectedAgent,
    fetchPerformanceData
  };
}