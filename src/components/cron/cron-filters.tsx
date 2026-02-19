'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface CronFiltersProps {
  filter: string;
  searchTerm: string;
  frequencyFilter: string;
  setFilter: (filter: string) => void;
  setSearchTerm: (term: string) => void;
  setFrequencyFilter: (filter: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function CronFilters({
  filter,
  searchTerm,
  frequencyFilter,
  setFilter,
  setSearchTerm,
  setFrequencyFilter,
  onRefresh,
  loading
}: CronFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-surface-1 rounded-lg border">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs or agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
            disabled={loading}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="idle">Idle</option>
            <option value="ok">OK</option>
            <option value="error">Error</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Frequency Filter */}
        <select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading}
        >
          <option value="all">All Frequencies</option>
          <option value="minutes">Every Few Minutes</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="cron">Custom Cron</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Refresh Button */}
      <Button 
        onClick={onRefresh} 
        variant="outline"
        disabled={loading}
        className="flex items-center space-x-2"
      >
        <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </Button>
    </div>
  );
}