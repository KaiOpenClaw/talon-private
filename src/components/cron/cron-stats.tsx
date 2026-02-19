'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Pause,
  Play,
  TrendingUp,
  Timer
} from 'lucide-react';

interface CronStatsProps {
  stats: {
    total: number;
    running: number;
    idle: number;
    ok: number;
    error: number;
    disabled: number;
  };
  loading: boolean;
}

export default function CronStats({ stats, loading }: CronStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const healthScore = stats.total > 0 ? 
    Math.round(((stats.ok + stats.idle) / stats.total) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cron Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor scheduled tasks and automation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`${
                healthScore >= 90 ? 'border-green-500 text-green-500' :
                healthScore >= 70 ? 'border-yellow-500 text-yellow-500' :
                'border-red-500 text-red-500'
              }`}
            >
              {healthScore}% Healthy
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-500">{stats.running}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-500">{stats.ok + stats.idle}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-500">{stats.error + stats.disabled}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Status Breakdown
          </CardTitle>
          <CardDescription>
            Current status distribution across all cron jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.running}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.idle}</div>
              <div className="text-sm text-muted-foreground">Idle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.ok}</div>
              <div className="text-sm text-muted-foreground">OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.error}</div>
              <div className="text-sm text-muted-foreground">Error</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{stats.disabled}</div>
              <div className="text-sm text-muted-foreground">Disabled</div>
            </div>
          </div>

          {/* Health Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>System Health</span>
              <span>{healthScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  healthScore >= 90 ? 'bg-green-500' :
                  healthScore >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}