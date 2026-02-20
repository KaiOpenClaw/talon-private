'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, GitBranch, Star, GitFork, Eye, AlertCircle, Activity } from 'lucide-react';

interface AnalyticsData {
  repository: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    createdAt: string;
    lastUpdated: string;
    lastPush: string;
  };
  commits: {
    total: number;
    recentWeeks: Array<{
      week: string;
      count: number;
      additions: number;
      deletions: number;
    }>;
    weeklyAverage: number;
    dailyAverage: number;
  };
  trends: {
    starsGrowth: number;
    forksGrowth: number;
    commitVelocity: number;
  };
  lastUpdated: string;
}

interface ApiResponse {
  success: boolean;
  data: AnalyticsData | null;
  error?: string;
  meta?: {
    responseTime: string;
    source: string;
    rateLimitRemaining: string;
  };
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const TrendIndicator: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {label}
        </Badge>
      ) : (
        <Badge 
          variant={isPositive ? "default" : "destructive"} 
          className="flex items-center gap-1"
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(value)}% {label}
        </Badge>
      )}
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
}> = ({ title, value, icon, trend, subtitle }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{formatNumber(value)}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className="mt-2">
          <TrendIndicator value={trend} label="change" />
        </div>
      )}
    </CardContent>
  </Card>
);

const CommitChart: React.FC<{ weeks: AnalyticsData['commits']['recentWeeks'] }> = ({ weeks }) => {
  const maxCommits = Math.max(...weeks.map(w => w.count));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Commit Activity (Last 8 Weeks)</span>
        <span>Max: {maxCommits} commits</span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {weeks.map((week, index) => (
          <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-primary rounded-sm min-h-[2px] transition-all hover:bg-primary/80"
              style={{ 
                height: `${maxCommits > 0 ? (week.count / maxCommits) * 100 : 0}%`,
                minHeight: week.count > 0 ? '8px' : '2px'
              }}
              title={`Week ${week.week}: ${week.count} commits`}
            />
            <span className="text-xs text-muted-foreground rotate-45 origin-bottom-left">
              {new Date(week.week).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/github');
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setLastRefresh(new Date().toLocaleTimeString());
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="animate-spin">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Button onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Analytics
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time growth metrics and development insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh}
            </span>
          )}
          <Button onClick={fetchAnalytics} disabled={loading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="GitHub Stars"
          value={data.repository.stars}
          icon={<Star />}
          trend={data.trends.starsGrowth}
          subtitle="Repository popularity"
        />
        <MetricCard
          title="Forks"
          value={data.repository.forks}
          icon={<GitFork />}
          trend={data.trends.forksGrowth}
          subtitle="Community contributions"
        />
        <MetricCard
          title="Watchers"
          value={data.repository.watchers}
          icon={<Eye />}
          subtitle="Active followers"
        />
        <MetricCard
          title="Open Issues"
          value={data.repository.openIssues}
          icon={<AlertCircle />}
          subtitle="Active development"
        />
      </div>

      {/* Development Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Development Velocity
            </CardTitle>
            <CardDescription>
              Commit activity and code changes over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{data.commits.dailyAverage}</div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.commits.weeklyAverage}</div>
                <div className="text-sm text-muted-foreground">Weekly Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(data.commits.total)}</div>
                <div className="text-sm text-muted-foreground">Total Commits</div>
              </div>
            </div>
            <TrendIndicator value={data.trends.commitVelocity} label="velocity" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commit Activity</CardTitle>
            <CardDescription>
              Weekly commit frequency and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommitChart weeks={data.commits.recentWeeks} />
          </CardContent>
        </Card>
      </div>

      {/* Repository Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Timeline</CardTitle>
          <CardDescription>
            Key milestone dates and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-medium">Created</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(data.repository.createdAt)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(data.repository.createdAt)}
              </div>
            </div>
            <div>
              <div className="font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(data.repository.lastUpdated)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(data.repository.lastUpdated)}
              </div>
            </div>
            <div>
              <div className="font-medium">Last Push</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(data.repository.lastPush)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(data.repository.lastPush)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}