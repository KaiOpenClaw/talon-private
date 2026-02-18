'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  response_time?: number;
  last_check: string;
}

interface MonitoringData {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  checks: HealthCheck[];
}

const statusIcons = {
  ok: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  error: <AlertTriangle className="w-4 h-4 text-red-500" />
};

const statusColors = {
  ok: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  error: 'bg-red-100 text-red-800 border-red-200'
};

const overallStatusColors = {
  healthy: 'text-green-600',
  degraded: 'text-yellow-600',
  unhealthy: 'text-red-600'
};

export function HealthDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      setError(null);
      const response = await fetch('/api/monitor/health');
      const data = await response.json();
      setMonitoringData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading health data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Health Monitor Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchHealth} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!monitoringData) return null;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchHealth}
                className="h-8"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-8"
              >
                Auto-refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Overall Status</p>
              <p className={`text-lg font-semibold capitalize ${overallStatusColors[monitoringData.overall_status]}`}>
                {monitoringData.overall_status}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-lg font-mono">{monitoringData.version}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg">{formatUptime(monitoringData.uptime_seconds)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Last Check</p>
              <p className="text-sm text-gray-500">
                {new Date(monitoringData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoringData.checks.map((check) => (
              <div
                key={check.name}
                className={`p-4 rounded-lg border-2 ${statusColors[check.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcons[check.status]}
                    <h3 className="font-medium capitalize">
                      {check.name.replace('_', ' ')}
                    </h3>
                  </div>
                  <Badge variant={check.status === 'ok' ? 'default' : 
                               check.status === 'warning' ? 'secondary' : 'destructive'}>
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm mb-2">{check.message}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-600">
                  {check.response_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatResponseTime(check.response_time)}
                    </span>
                  )}
                  <span>
                    {new Date(check.last_check).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(monitoringData.overall_status === 'degraded' || monitoringData.overall_status === 'unhealthy') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monitoringData.checks
                .filter(check => check.status !== 'ok')
                .map((check) => (
                  <div key={check.name} className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium capitalize">{check.name.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-orange-700">{check.message}</p>
                    {check.name === 'gateway' && (
                      <p className="text-xs text-orange-600 mt-1">
                        Check GATEWAY_URL and GATEWAY_TOKEN configuration
                      </p>
                    )}
                    {check.name === 'environment' && (
                      <p className="text-xs text-orange-600 mt-1">
                        Verify all required environment variables are set
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}