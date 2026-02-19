'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Timer
} from 'lucide-react';
import { CronJob } from '@/hooks/use-cron';

interface CronJobCardProps {
  job: CronJob;
  index: number;
  focusedIndex: number;
  itemProps: any;
  onRun: (jobId: string) => void;
  onToggle: (jobId: string, enable: boolean) => void;
  parseNextRun: (nextRun: string) => string;
  parseLastRun: (lastRun: string) => string;
  getFrequencyCategory: (schedule: string) => string;
}

export default function CronJobCard({
  job,
  index,
  focusedIndex,
  itemProps,
  onRun,
  onToggle,
  parseNextRun,
  parseLastRun,
  getFrequencyCategory
}: CronJobCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Timer className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'disabled':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'idle':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'running': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'ok': 'bg-green-500/20 text-green-400 border-green-500/30',
      'error': 'bg-red-500/20 text-red-400 border-red-500/30',
      'disabled': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'idle': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${variants[status as keyof typeof variants] || variants.idle}`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <Card 
      {...itemProps}
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        focusedIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${itemProps.className || ''}`}
      onClick={() => onRun(job.id)}
      role="button"
      aria-label={`${job.name} - Status: ${job.status} - Agent: ${job.agent} - Press Enter to run`}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                onRun(job.id);
              }}
              disabled={job.status === 'running'}
              aria-label={`Run job ${job.name}`}
              title="Run job immediately"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(job.id, job.status === 'disabled');
              }}
              aria-label={job.status === 'disabled' ? `Enable job ${job.name}` : `Disable job ${job.name}`}
              title={job.status === 'disabled' ? 'Enable this job' : 'Disable this job'}
            >
              {job.status === 'disabled' ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}