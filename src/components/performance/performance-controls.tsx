'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface PerformanceControlsProps {
  timeRange: string;
  selectedAgent: string;
  activeTab: string;
  loading: boolean;
  setTimeRange: (range: string) => void;
  setSelectedAgent: (agent: string) => void;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export default function PerformanceControls({
  timeRange,
  selectedAgent,
  activeTab,
  loading,
  setTimeRange,
  setSelectedAgent,
  setActiveTab,
  onRefresh
}: PerformanceControlsProps) {
  const timeRanges = [
    { value: '5m', label: '5 minutes' },
    { value: '10m', label: '10 minutes' },
    { value: '30m', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' }
  ];

  const agents = [
    { value: 'all', label: 'All Agents' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'coach', label: 'Coach' },
    { value: 'talon', label: 'Talon' },
    { value: 'vellaco-content', label: 'Vellaco Content' },
    { value: '0dte', label: '0DTE' }
  ];

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'metrics', label: 'Metrics' },
    { value: 'errors', label: 'Errors' },
    { value: 'system', label: 'System' }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <Button 
          onClick={onRefresh} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Time Range Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
          <div className="flex space-x-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range.value)}
                disabled={loading}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Agent Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Agent:</span>
          <div className="flex space-x-1">
            {agents.map((agent) => (
              <Button
                key={agent.value}
                variant={selectedAgent === agent.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAgent(agent.value)}
                disabled={loading}
              >
                {agent.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            disabled={loading}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}