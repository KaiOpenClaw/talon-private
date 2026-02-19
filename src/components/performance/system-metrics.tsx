'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { SystemMetrics as ISystemMetrics } from '@/hooks/use-performance';

interface SystemMetricsProps {
  systemMetrics: ISystemMetrics | null;
  loading: boolean;
}

export default function SystemMetrics({ systemMetrics, loading }: SystemMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center animate-pulse">
                <div className="h-5 w-5 bg-gray-700 rounded mr-2"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthStatus = () => {
    if (!systemMetrics) return 'Unknown';
    
    const { errorRate, requestsPerMinute, activeConnections } = systemMetrics;
    
    if (errorRate > 0.05) return 'Poor';
    if (errorRate > 0.02) return 'Fair';
    if (requestsPerMinute > 100 && activeConnections > 50) return 'Excellent';
    if (requestsPerMinute > 50) return 'Good';
    return 'Fair';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-green-300';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Excellent':
      case 'Good': 
        return <Target className="h-4 w-4 text-green-500" />;
      case 'Fair': 
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'Poor': 
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: 
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
          <CardDescription>
            Overall system performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemMetrics && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Health Status</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthStatus)}
                  <Badge className={`${getHealthColor(healthStatus)} bg-transparent border-current`}>
                    {healthStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-lg font-bold">{systemMetrics.activeConnections}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Requests/Minute</span>
                <span className="text-lg font-bold">{systemMetrics.requestsPerMinute}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Rate</span>
                <span className={`text-lg font-bold ${
                  systemMetrics.errorRate > 0.05 ? 'text-red-400' : 
                  systemMetrics.errorRate > 0.02 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {(systemMetrics.errorRate * 100).toFixed(2)}%
                </span>
              </div>
            </>
          )}
          {!systemMetrics && (
            <p className="text-center text-muted-foreground py-4">
              No system metrics available
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Resource Utilization
          </CardTitle>
          <CardDescription>
            Current resource usage and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemMetrics && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Connection Load</span>
                  <span>{systemMetrics.activeConnections}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((systemMetrics.activeConnections / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Request Rate</span>
                  <span>{systemMetrics.requestsPerMinute}/200</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((systemMetrics.requestsPerMinute / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Error Rate</span>
                  <span>{(systemMetrics.errorRate * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(systemMetrics.errorRate * 2000, 100)}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
          {!systemMetrics && (
            <p className="text-center text-muted-foreground py-4">
              No resource data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}