'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { PerformanceMetric } from '@/hooks/use-performance';

interface SlowOperationsProps {
  slowestOps: PerformanceMetric[];
  loading: boolean;
}

// Utility function for formatting duration
function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function SlowOperations({ slowestOps, loading }: SlowOperationsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Slowest Operations
          </CardTitle>
          <CardDescription>Loading performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
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
          <Clock className="h-5 w-5 mr-2" />
          Slowest Operations
        </CardTitle>
        <CardDescription>
          Operations with the highest response times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {slowestOps.map((op, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <div>
                  <p className="font-medium">{op.operation}</p>
                  {op.agent && (
                    <p className="text-sm text-muted-foreground">{op.agent}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-400">{formatDuration(op.duration)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(op.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {slowestOps.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No operations recorded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}