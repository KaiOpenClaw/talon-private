import { NextRequest, NextResponse } from 'next/server';

interface GitHubRepoData {
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number; // watchers
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubCommitsData {
  total: number;
  weeks: Array<{
    w: number; // Unix timestamp
    a: number; // additions
    d: number; // deletions
    c: number; // commits
  }>;
}

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
    starsGrowth: number; // Placeholder for now
    forksGrowth: number; // Placeholder for now
    commitVelocity: number;
  };
  lastUpdated: string;
}

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'KaiOpenClaw';
const REPO_NAME = 'talon-private';

async function fetchGitHubData(endpoint: string): Promise<any> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Talon-Analytics/1.0'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers,
    next: { revalidate: 300 } // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Fetch repository data
    const repoData: GitHubRepoData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    // Fetch commit statistics
    const commitsData: GitHubCommitsData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/stats/participation`);

    // Process recent weeks commit data
    const recentWeeks = commitsData.weeks
      .slice(-8) // Last 8 weeks
      .map(week => ({
        week: new Date(week.w * 1000).toISOString().split('T')[0],
        count: week.c,
        additions: week.a,
        deletions: week.d
      }));

    // Calculate velocity metrics
    const totalRecentCommits = recentWeeks.reduce((sum, week) => sum + week.count, 0);
    const weeklyAverage = Math.round(totalRecentCommits / recentWeeks.length * 10) / 10;
    const dailyAverage = Math.round(weeklyAverage / 7 * 10) / 10;

    // Calculate commit velocity trend (recent 4 weeks vs previous 4 weeks)
    const recentPeriod = recentWeeks.slice(-4).reduce((sum, week) => sum + week.count, 0);
    const previousPeriod = recentWeeks.slice(-8, -4).reduce((sum, week) => sum + week.count, 0);
    const commitVelocity = previousPeriod > 0 ? ((recentPeriod - previousPeriod) / previousPeriod * 100) : 0;

    const analyticsData: AnalyticsData = {
      repository: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.subscribers_count,
        openIssues: repoData.open_issues_count,
        createdAt: repoData.created_at,
        lastUpdated: repoData.updated_at,
        lastPush: repoData.pushed_at
      },
      commits: {
        total: commitsData.total,
        recentWeeks,
        weeklyAverage,
        dailyAverage
      },
      trends: {
        starsGrowth: 0, // Placeholder - would need historical data
        forksGrowth: 0, // Placeholder - would need historical data
        commitVelocity: Math.round(commitVelocity * 10) / 10
      },
      lastUpdated: new Date().toISOString()
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: analyticsData,
      meta: {
        responseTime: `${responseTime}ms`,
        source: 'github-api',
        rateLimitRemaining: 'unknown' // GitHub headers would show this
      }
    });

  } catch (error) {
    console.error('GitHub Analytics API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: `/api/analytics/github`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch GitHub analytics',
      data: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Method not allowed. Use GET to fetch analytics data.'
  }, { status: 405 });
}