#!/usr/bin/env npx tsx

/**
 * Health Monitor Script for Talon Infrastructure
 * 
 * This script monitors the Talon deployment and creates GitHub issues
 * when problems are detected. It's designed to be run via cron.
 * 
 * Usage:
 *   npx tsx scripts/health-monitor.ts [--dry-run] [--verbose]
 * 
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub token for creating issues
 *   DEPLOYMENT_URL - Talon deployment URL to monitor
 *   ALERT_THRESHOLD_MINUTES - How long to wait before alerting (default: 5)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

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

interface AlertState {
  lastAlert: string;
  alertCount: number;
  service: string;
  status: string;
}

class HealthMonitor {
  private deploymentUrl: string;
  private githubToken: string;
  private alertThreshold: number;
  private dryRun: boolean;
  private verbose: boolean;
  private alertStateFile: string;

  constructor() {
    this.deploymentUrl = process.env.DEPLOYMENT_URL || 'https://talon-private.onrender.com';
    this.githubToken = process.env.GITHUB_TOKEN || '';
    this.alertThreshold = parseInt(process.env.ALERT_THRESHOLD_MINUTES || '5');
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
    this.alertStateFile = '/tmp/talon-health-alerts.json';

    if (!this.githubToken && !this.dryRun) {
      console.error('GITHUB_TOKEN environment variable required');
      process.exit(1);
    }
  }

  async run() {
    this.log('🏥 Starting Talon Health Monitor...');
    this.log(`Monitoring: ${this.deploymentUrl}`);
    this.log(`Alert threshold: ${this.alertThreshold} minutes`);
    
    try {
      const healthData = await this.checkHealth();
      const alerts = await this.processHealthData(healthData);
      
      if (alerts.length > 0) {
        this.log(`⚠️ Found ${alerts.length} issues requiring attention`);
        
        for (const alert of alerts) {
          if (!this.dryRun) {
            await this.createOrUpdateGitHubIssue(alert);
          } else {
            this.log(`DRY RUN: Would create GitHub issue for ${alert.service}`);
          }
        }
      } else {
        this.log('✅ All systems healthy');
        await this.closeResolvedIssues();
      }

      await this.updateAlertState(alerts);
      
    } catch (error) {
      this.log(`💥 Monitor failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (!this.dryRun) {
        await this.createCriticalAlert({
          service: 'health_monitor',
          status: 'error',
          message: `Health monitoring system failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical'
        });
      }
      
      process.exit(1);
    }
  }

  private async checkHealth(): Promise<MonitoringData> {
    this.log('🔍 Checking deployment health...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.deploymentUrl}/api/monitor/health`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Talon-Health-Monitor/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health endpoint returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.log(`📊 Health status: ${data.overall_status}`);
      
      return data;
      
    } catch (error) {
      // If health endpoint fails, create a synthetic failure report
      return {
        overall_status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: 'unknown',
        uptime_seconds: 0,
        checks: [
          {
            name: 'deployment',
            status: 'error',
            message: `Deployment unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
            last_check: new Date().toISOString()
          }
        ]
      };
    }
  }

  private async processHealthData(data: MonitoringData): Promise<AlertState[]> {
    const alerts: AlertState[] = [];
    
    // Check overall status
    if (data.overall_status !== 'healthy') {
      const failedChecks = data.checks.filter(c => c.status === 'error');
      const warningChecks = data.checks.filter(c => c.status === 'warning');
      
      for (const check of failedChecks) {
        alerts.push({
          service: check.name,
          status: 'error',
          lastAlert: new Date().toISOString(),
          alertCount: 1
        });
      }
      
      // Only alert on warnings if they're persistent
      if (data.overall_status === 'degraded' && failedChecks.length === 0) {
        const persistentWarnings = await this.checkPersistentWarnings(warningChecks);
        alerts.push(...persistentWarnings);
      }
    }

    return alerts;
  }

  private async checkPersistentWarnings(warnings: HealthCheck[]): Promise<AlertState[]> {
    // Only alert on warnings that have been present for more than the threshold
    const alerts: AlertState[] = [];
    
    for (const warning of warnings) {
      const lastCheckTime = new Date(warning.last_check);
      const minutesAgo = (Date.now() - lastCheckTime.getTime()) / (1000 * 60);
      
      if (minutesAgo >= this.alertThreshold) {
        alerts.push({
          service: warning.name,
          status: 'warning',
          lastAlert: new Date().toISOString(),
          alertCount: 1
        });
      }
    }
    
    return alerts;
  }

  private async createOrUpdateGitHubIssue(alert: AlertState) {
    const title = this.getIssueTitle(alert);
    const body = await this.getIssueBody(alert);
    const labels = this.getIssueLabels(alert);

    this.log(`📝 Creating/updating GitHub issue: ${title}`);
    
    try {
      // Check if similar issue already exists
      const existingIssue = await this.findExistingIssue(alert.service);
      
      if (existingIssue) {
        await this.updateIssue(existingIssue.number, body);
        this.log(`✏️ Updated existing issue #${existingIssue.number}`);
      } else {
        const issueNumber = await this.createIssue(title, body, labels);
        this.log(`🆕 Created new issue #${issueNumber}`);
      }
      
    } catch (error) {
      this.log(`❌ Failed to create/update GitHub issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getIssueTitle(alert: AlertState): string {
    const emoji = alert.status === 'error' ? '🚨' : '⚠️';
    const severity = alert.status === 'error' ? 'CRITICAL' : 'WARNING';
    const service = alert.service.replace('_', ' ').toUpperCase();
    
    return `${emoji} ${severity}: ${service} - Infrastructure Health Issue`;
  }

  private async getIssueBody(alert: AlertState): Promise<string> {
    const timestamp = new Date().toISOString();
    const service = alert.service.replace('_', ' ');
    
    return `## 🚨 Infrastructure Alert - ${service}

**Alert Time:** ${timestamp}
**Severity:** ${alert.status.toUpperCase()}
**Service:** ${alert.service}
**Alert Count:** ${alert.alertCount}

### Problem Description
The ${service} service is experiencing issues and requires immediate attention.

### Current Status
- **Service:** ${alert.service}
- **Status:** ${alert.status}
- **Detection Time:** ${alert.lastAlert}
- **Deployment URL:** ${this.deploymentUrl}

### Recommended Actions
${this.getRecommendedActions(alert.service, alert.status)}

### Health Check Commands
\`\`\`bash
# Check deployment status
curl -I ${this.deploymentUrl}

# Check health endpoint
curl ${this.deploymentUrl}/api/monitor/health

# Run local health monitor
npx tsx scripts/health-monitor.ts --verbose
\`\`\`

### Monitoring Dashboard
View detailed health status: ${this.deploymentUrl}/system

---
*This issue was automatically created by the Talon Health Monitor*
*Repository: KaiOpenClaw/talon-private*
*Monitor Version: 1.0.0*`;
  }

  private getRecommendedActions(service: string, status: string): string {
    const actions = {
      deployment: [
        '1. Check Render deployment logs for build/startup errors',
        '2. Verify all environment variables are configured',
        '3. Check if service is running on correct port (10000)',
        '4. Review recent commits for breaking changes'
      ],
      gateway: [
        '1. Verify GATEWAY_URL and GATEWAY_TOKEN configuration',
        '2. Check OpenClaw gateway service status',
        '3. Test connection: `curl -H "Authorization: Bearer $TOKEN" $GATEWAY_URL/api/health`',
        '4. Review gateway logs for connection issues'
      ],
      talon_api: [
        '1. Check Talon API service status: `systemctl status talon-api`',
        '2. Verify TALON_API_URL and TALON_API_TOKEN configuration',
        '3. Restart service: `systemctl restart talon-api`',
        '4. Check service logs: `journalctl -u talon-api -f`'
      ],
      openai: [
        '1. Verify OPENAI_API_KEY is valid and has quota',
        '2. Check OpenAI service status: https://status.openai.com/',
        '3. Test API key: `curl -H "Authorization: Bearer $KEY" https://api.openai.com/v1/models`',
        '4. Review usage limits and billing status'
      ],
      lancedb: [
        '1. Check LanceDB path and permissions',
        '2. Verify vector search index exists',
        '3. Re-index if necessary: `npx tsx scripts/index-workspaces.ts`',
        '4. Check disk space and memory usage'
      ],
      environment: [
        '1. Review missing environment variables',
        '2. Check Render dashboard environment configuration',
        '3. Verify secrets are properly set',
        '4. Restart deployment after configuration changes'
      ]
    };

    const serviceActions = actions[service as keyof typeof actions] || [
      '1. Review service logs for error messages',
      '2. Check service configuration and dependencies',
      '3. Restart affected services if necessary',
      '4. Monitor status after changes'
    ];

    return serviceActions.map(action => `- ${action}`).join('\n');
  }

  private getIssueLabels(alert: AlertState): string[] {
    const labels = ['automated-alert', 'infrastructure'];
    
    if (alert.status === 'error') {
      labels.push('priority: critical', 'bug');
    } else {
      labels.push('priority: high', 'enhancement');
    }
    
    // Add service-specific labels
    const serviceLabels: Record<string, string[]> = {
      deployment: ['deployment'],
      gateway: ['backend', 'integration'],
      talon_api: ['backend', 'api'],
      openai: ['external-service', 'search'],
      lancedb: ['database', 'search'],
      environment: ['configuration']
    };
    
    labels.push(...(serviceLabels[alert.service] || []));
    
    return labels;
  }

  private async findExistingIssue(service: string): Promise<{number: number} | null> {
    if (this.dryRun) return null;
    
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo KaiOpenClaw/talon-private --state open --search "${service}" --json number,title --limit 10`
      );
      
      const issues = JSON.parse(stdout);
      const serviceTitle = service.replace('_', ' ').toUpperCase();
      
      return issues.find((issue: any) => 
        issue.title.includes(serviceTitle) && 
        issue.title.includes('Infrastructure Health Issue')
      ) || null;
      
    } catch (error) {
      this.log(`Failed to search for existing issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  private async createIssue(title: string, body: string, labels: string[]): Promise<number> {
    const labelArgs = labels.map(l => `--label "${l}"`).join(' ');
    
    const { stdout } = await execAsync(
      `gh issue create --repo KaiOpenClaw/talon-private --title "${title}" --body "${body}" ${labelArgs} --json number`
    );
    
    const result = JSON.parse(stdout);
    return result.number;
  }

  private async updateIssue(issueNumber: number, body: string) {
    const updateBody = `${body}\n\n---\n**Update:** ${new Date().toISOString()} - Issue still occurring, updating with latest status.`;
    
    await execAsync(
      `gh issue comment ${issueNumber} --repo KaiOpenClaw/talon-private --body "${updateBody}"`
    );
  }

  private async closeResolvedIssues() {
    // Close any automated infrastructure alerts that are no longer relevant
    if (this.dryRun) return;
    
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo KaiOpenClaw/talon-private --state open --label automated-alert --json number,title`
      );
      
      const issues = JSON.parse(stdout);
      
      for (const issue of issues) {
        if (issue.title.includes('Infrastructure Health Issue')) {
          this.log(`🎯 Closing resolved issue #${issue.number}`);
          
          await execAsync(
            `gh issue close ${issue.number} --repo KaiOpenClaw/talon-private --comment "✅ Infrastructure health restored. Auto-closing this alert."`
          );
        }
      }
      
    } catch (error) {
      this.log(`Failed to close resolved issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createCriticalAlert(alert: any) {
    const title = '🚨 CRITICAL: Health Monitoring System Failure';
    const body = `## Critical Infrastructure Alert

The Talon health monitoring system has failed and cannot perform automated monitoring.

**Error:** ${alert.message}
**Time:** ${new Date().toISOString()}
**Service:** ${alert.service}

### Immediate Actions Required
1. Check deployment status manually
2. Review monitor script logs
3. Fix underlying issues preventing monitoring
4. Restart monitoring after resolution

### Manual Health Check
\`\`\`bash
# Check deployment
curl -I ${this.deploymentUrl}

# Run monitor in verbose mode
npx tsx scripts/health-monitor.ts --verbose --dry-run
\`\`\`

---
*CRITICAL: Manual intervention required to restore automated monitoring*`;

    try {
      await this.createIssue(title, body, ['priority: critical', 'automated-alert', 'monitoring', 'infrastructure']);
    } catch (error) {
      this.log(`Failed to create critical alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async updateAlertState(alerts: AlertState[]) {
    // In a production system, we'd persist alert state to track repetitions
    // For now, just log the current state
    this.log(`📊 Alert state: ${alerts.length} active alerts`);
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new HealthMonitor();
  monitor.run().catch(error => {
    console.error('Monitor failed:', error);
    process.exit(1);
  });
}

export { HealthMonitor };