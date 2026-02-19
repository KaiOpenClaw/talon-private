'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { PerformanceMetric } from '@/hooks/use-performance';

interface ErrorLogsProps {
  recentErrors: PerformanceMetric[];
  loading: boolean;
}

// Utility function for formatting duration
function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function ErrorLogs({ recentErrors, loading }: ErrorLogsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Recent Errors
          </CardTitle>
          <CardDescription>Loading error logs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-800 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Recent Errors
        </CardTitle>
        <CardDescription>
          Latest failed operations and error details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentErrors.map((error, index) => (
            <div key={index} className="p-4 border border-red-800 rounded-lg bg-red-900/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{error.operation}</span>
                  {error.agent && (
                    <Badge variant="outline" className="text-xs">
                      {error.agent}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              {error.error && (
                <p className="text-sm text-red-400 bg-red-950/50 p-2 rounded">
                  {error.error}
                </p>
              )}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Duration: {formatDuration(error.duration)}</span>
                {error.metadata && Object.keys(error.metadata).length > 0 && (
                  <span>Metadata: {JSON.stringify(error.metadata)}</span>
                )}
              </div>
            </div>
          ))}
          {recentErrors.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No recent errors</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}