"use client";

import { useState, useEffect } from 'react';
import { logger, logError } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Search,
  Filter,
  RotateCcw,
  TrendingUp,
  Timer
} from 'lucide-react';

interface CronJob {
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

export function CronDashboard() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/cron');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      logError(error as Error, 'CronDashboard.fetchJobs');
      logger.error('Failed to fetch cron jobs', { 
        endpoint: '/api/cron',
        error: (error as Error).message 
      }, 'CronDashboard');
    } finally {
      setLoading(false);
    }
  };

  const runJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/cron/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      
      if (response.ok) {
        fetchJobs(); // Refresh list
      }
    } catch (error) {
      logError(error as Error, 'CronDashboard.runJob');
      logger.error('Failed to run cron job', { 
        jobId,
        endpoint: '/api/cron/run',
        error: (error as Error).message 
      }, 'CronDashboard');
    }
  };

  const toggleJob = async (jobId: string, enable: boolean) => {
    try {
      const response = await fetch('/api/cron/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, enabled: enable })
      });
      
      if (response.ok) {
        fetchJobs(); // Refresh list
      }
    } catch (error) {
      logError(error as Error, 'CronDashboard.toggleJob');
      logger.error('Failed to toggle cron job', { 
        jobId,
        enable,
        endpoint: '/api/cron/toggle',
        error: (error as Error).message 
      }, 'CronDashboard');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Timer className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'disabled':
        return <Pause className="h-4 w-4 text-gray-400" />;
      case 'idle':
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ok: 'default',
      running: 'outline',
      error: 'destructive',
      disabled: 'secondary',
      idle: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getFrequencyCategory = (schedule: string) => {
    if (schedule.includes('5m') || schedule.includes('15m')) return '5-15min';
    if (schedule.includes('1h') || schedule.includes('hourly')) return 'hourly';
    if (schedule.includes('6h')) return '6h';
    if (schedule.includes('daily') || schedule.includes('1d')) return 'daily';
    if (schedule.includes('weekly') || schedule.includes('7d')) return 'weekly';
    return 'other';
  };

  const parseNextRun = (nextRun: string) => {
    if (nextRun === '-' || !nextRun) return 'Not scheduled';
    if (nextRun.startsWith('in ')) return nextRun;
    return new Date(nextRun).toLocaleString();
  };

  const parseLastRun = (lastRun: string) => {
    if (lastRun === '-' || !lastRun) return 'Never';
    if (lastRun.includes('ago')) return lastRun;
    return new Date(lastRun).toLocaleString();
  };

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrequency = frequencyFilter === 'all' || 
                            getFrequencyCategory(job.schedule) === frequencyFilter;
    return matchesFilter && matchesSearch && matchesFrequency;
  });

  const jobCounts = {
    total: jobs.length,
    ok: jobs.filter(j => j.status === 'ok').length,
    running: jobs.filter(j => j.status === 'running').length,
    error: jobs.filter(j => j.status === 'error').length,
    disabled: jobs.filter(j => j.status === 'disabled').length,
    idle: jobs.filter(j => j.status === 'idle').length,
  };

  const frequencyCounts = {
    '5-15min': jobs.filter(j => getFrequencyCategory(j.schedule) === '5-15min').length,
    'hourly': jobs.filter(j => getFrequencyCategory(j.schedule) === 'hourly').length,
    '6h': jobs.filter(j => getFrequencyCategory(j.schedule) === '6h').length,
    'daily': jobs.filter(j => getFrequencyCategory(j.schedule) === 'daily').length,
    'weekly': jobs.filter(j => getFrequencyCategory(j.schedule) === 'weekly').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{jobCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">OK</p>
                <p className="text-2xl font-bold text-green-600">{jobCounts.ok}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-600">{jobCounts.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{jobCounts.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Idle</p>
                <p className="text-2xl font-bold text-gray-600">{jobCounts.idle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold text-gray-600">{jobCounts.disabled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frequency Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Jobs by Frequency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(frequencyCounts).map(([freq, count]) => (
              <div key={freq} className="text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{freq}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="ok">OK ({jobCounts.ok})</option>
          <option value="running">Running ({jobCounts.running})</option>
          <option value="error">Errors ({jobCounts.error})</option>
          <option value="idle">Idle ({jobCounts.idle})</option>
          <option value="disabled">Disabled ({jobCounts.disabled})</option>
        </select>

        <select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Frequencies</option>
          <option value="5-15min">5-15 min ({frequencyCounts['5-15min']})</option>
          <option value="hourly">Hourly ({frequencyCounts.hourly})</option>
          <option value="6h">6 Hours ({frequencyCounts['6h']})</option>
          <option value="daily">Daily ({frequencyCounts.daily})</option>
          <option value="weekly">Weekly ({frequencyCounts.weekly})</option>
        </select>

        <Button onClick={fetchJobs} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{job.name}</h3>
                      {getStatusBadge(job.status)}
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyCategory(job.schedule)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center space-x-1">
                        <span>Agent: {job.agent}</span>
                        <span>•</span>
                        <span>Schedule: {job.schedule}</span>
                        <span>•</span>
                        <span>Target: {job.target}</span>
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Next: {parseNextRun(job.nextRun)} • Last: {parseLastRun(job.lastRun)}
                    </div>
                    {job.errorMessage && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {job.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runJob(job.id)}
                    disabled={job.status === 'running'}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleJob(job.id, job.status === 'disabled')}
                  >
                    {job.status === 'disabled' ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No cron jobs found matching your criteria.
        </div>
      )}
    </div>
  );
}