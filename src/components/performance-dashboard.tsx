'use client';

import React, { useState } from 'react';
import { usePerformance } from '@/hooks/use-performance';
import PerformanceControls from '@/components/performance/performance-controls';
import PerformanceStats from '@/components/performance/performance-stats';
import ErrorLogs from '@/components/performance/error-logs';
import SlowOperations from '@/components/performance/slow-operations';
import SystemMetrics from '@/components/performance/system-metrics';

export default function PerformanceDashboard() {
  const {
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
  } = usePerformance();

  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PerformanceStats stats={stats} systemMetrics={systemMetrics} loading={loading} />;
      
      case 'metrics':
        return <SlowOperations slowestOps={slowestOps} loading={loading} />;
      
      case 'errors':
        return <ErrorLogs recentErrors={recentErrors} loading={loading} />;
      
      case 'system':
        return <SystemMetrics systemMetrics={systemMetrics} loading={loading} />;
      
      default:
        return <PerformanceStats stats={stats} systemMetrics={systemMetrics} loading={loading} />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PerformanceControls
        timeRange={timeRange}
        selectedAgent={selectedAgent}
        activeTab={activeTab}
        loading={loading}
        setTimeRange={setTimeRange}
        setSelectedAgent={setSelectedAgent}
        setActiveTab={setActiveTab}
        onRefresh={fetchPerformanceData}
      />

      <div className="space-y-6">
        {renderTabContent()}
      </div>
    </div>
  );
}