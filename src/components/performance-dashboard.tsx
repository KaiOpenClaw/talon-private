'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  Zap,
  Target,
  RotateCcw
} from 'lucide-react';

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  agent?: string;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorCount: number;
  operationsPerMinute: number;
}

interface SystemMetrics {
  timestamp: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([]);
  const [recentErrors, setRecentErrors] = useState<PerformanceMetric[]>([]);
  const [slowestOps, setSlowestOps] = useState<PerformanceMetric[]>([]);
  const [timeRange, setTimeRange] = useState('10m');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch current performance stats
      const statsResponse = await fetch(`/api/performance/stats?timeRange=${timeRange}&agent=${selectedAgent}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch system metrics
      const systemResponse = await fetch('/api/performance/system');
      const systemData = await systemResponse.json();
      setSystemMetrics(systemData);
      
      // Fetch recent metrics
      const metricsResponse = await fetch(`/api/performance/metrics?limit=50&timeRange=${timeRange}&agent=${selectedAgent}`);
      const metricsData = await metricsResponse.json();
      setRecentMetrics(metricsData);
      
      // Fetch recent errors
      const errorsResponse = await fetch('/api/performance/errors?limit=10');
      const errorsData = await errorsResponse.json();
      setRecentErrors(errorsData);
      
      // Fetch slowest operations
      const slowestResponse = await fetch('/api/performance/slowest?limit=10');
      const slowestData = await slowestResponse.json();
      setSlowestOps(slowestData);
      
    } catch (error) {
      logger.error('Failed to fetch performance data', {
        component: 'PerformanceDashboard',
        action: 'fetchPerformanceData',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [timeRange, selectedAgent]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthColor = (successRate: number) => {
    if (successRate >= 0.95) return 'text-green-500';
    if (successRate >= 0.90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceColor = (responseTime: number) => {
    if (responseTime <= 1000) return 'text-green-500';
    if (responseTime <= 3000) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <div className="animate-pulse flex space-x-4">
            <div className="bg-gray-700 h-8 w-20 rounded"></div>
            <div className="bg-gray-700 h-8 w-24 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="bg-gray-700 h-4 w-24 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-700 h-8 w-16 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 w-32 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor AI agent performance, response times, and system health
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Buttons */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            {['5m', '10m', '1h', '6h', '1d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Agent Filter Buttons */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'talon', label: 'Talon' },
              { value: 'duplex', label: 'Duplex' },
              { value: 'coach', label: 'Coach' }
            ].map((agent) => (
              <button
                key={agent.value}
                onClick={() => setSelectedAgent(agent.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedAgent === agent.value
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {agent.label}
              </button>
            ))}
          </div>
          
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats ? getHealthColor(stats.successRate) : 'text-gray-400'}`}>
              {stats ? formatPercentage(stats.successRate) : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? `${stats.totalOperations} operations` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats ? getPerformanceColor(stats.averageResponseTime) : 'text-gray-400'}`}>
              {stats ? formatDuration(stats.averageResponseTime) : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {stats ? formatDuration(stats.p95ResponseTime) : '---'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operations/Min</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.operationsPerMinute.toFixed(1) : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemMetrics?.errorRate && systemMetrics.errorRate > 0.05 ? 'text-red-500' : 'text-green-500'}`}>
              {systemMetrics ? formatPercentage(systemMetrics.errorRate) : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? `${stats.errorCount} errors` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { value: 'overview', label: 'Overview' },
          { value: 'operations', label: 'Operations' },
          { value: 'errors', label: 'Errors' },
          { value: 'system', label: 'System' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Last {recentMetrics.length} operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentMetrics.slice(0, 10).map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    {metric.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{metric.operation}</span>
                    {metric.agent && (
                      <Badge variant="outline" className="text-xs">
                        {metric.agent}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatDuration(metric.duration)}</span>
                    <span>{new Date(metric.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {recentMetrics.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No recent operations
                </p>
              )}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Summary
              </CardTitle>
              <CardDescription>
                Key metrics for the selected time range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-900/20">
                      <p className="text-2xl font-bold text-green-500">{stats.totalOperations}</p>
                      <p className="text-xs text-muted-foreground">Total Operations</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-900/20">
                      <p className="text-2xl font-bold text-blue-500">{formatPercentage(stats.successRate)}</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex justify-between text-sm">
                      <span>Average Response</span>
                      <span className="font-medium">{formatDuration(stats.averageResponseTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>95th Percentile</span>
                      <span className="font-medium">{formatDuration(stats.p95ResponseTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>99th Percentile</span>
                      <span className="font-medium">{formatDuration(stats.p99ResponseTime)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'operations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Slowest Operations
            </CardTitle>
            <CardDescription>
              Operations taking the longest to complete
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
      )}

      {activeTab === 'errors' && (
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
      )}

      {activeTab === 'system' && (
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
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="text-sm font-medium">{systemMetrics.activeConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Requests/Minute</span>
                    <span className="text-sm font-medium">{systemMetrics.requestsPerMinute.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className={`text-sm font-medium ${systemMetrics.errorRate > 0.05 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatPercentage(systemMetrics.errorRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm font-medium">
                      {new Date(systemMetrics.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="text-center p-4 rounded-lg bg-gray-800">
                    <p className="text-lg font-bold text-green-500">{formatPercentage(stats.successRate)}</p>
                    <p className="text-sm text-muted-foreground">Overall Success Rate</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Operations This Period</span>
                      <span className="font-medium">{stats.totalOperations}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Count</span>
                      <span className="font-medium text-red-400">{stats.errorCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Rate</span>
                      <span className="font-medium">{stats.operationsPerMinute.toFixed(1)}/min</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}