import { Octokit } from '@octokit/rest';
import { getConfig } from '@patentrack/shared';
import type { CheckResult } from './health-checker';

export interface GitHubIssueOptions {
  checkName: string;
  severity: 'critical' | 'warning' | 'info';
  details: string;
  timestamp: string;
}

export class GitHubReporter {
  private octokit: Octokit | null = null;
  private config = getConfig();

  private getOctokit(): Octokit {
    if (!this.octokit) {
      if (!this.config.GITHUB_TOKEN) {
        throw new Error('GITHUB_TOKEN not configured');
      }
      this.octokit = new Octokit({ auth: this.config.GITHUB_TOKEN });
    }
    return this.octokit;
  }

  async createAlert(options: GitHubIssueOptions): Promise<void> {
    try {
      const octokit = this.getOctokit();
      
      const title = `[ALERT] ${options.checkName} failed — ${options.timestamp}`;
      const body = `## Alert Details

**Check:** ${options.checkName}
**Severity:** ${options.severity}
**Timestamp:** ${options.timestamp}

### Details

${options.details}

### Remediation

Please check the health dashboard and logs for more information.

---
*This issue was created automatically by the PatenTrack monitoring system.*`;

      // Check for existing open issue
      const existingIssues = await octokit.issues.listForRepo({
        owner: this.config.GITHUB_REPO_OWNER,
        repo: this.config.GITHUB_REPO_NAME,
        state: 'open',
        labels: 'production-alert',
      });

      const duplicate = existingIssues.data.find(issue => 
        issue.title.includes(options.checkName)
      );

      if (duplicate) {
        console.log(`Duplicate alert found for ${options.checkName}, skipping...`);
        return;
      }

      await octokit.issues.create({
        owner: this.config.GITHUB_REPO_OWNER,
        repo: this.config.GITHUB_REPO_NAME,
        title,
        body,
        labels: ['production-alert', options.severity],
      });

      console.log(`✅ Created GitHub issue for ${options.checkName}`);
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);
    }
  }

  async reportFailedChecks(checks: CheckResult[]): Promise<void> {
    const failedChecks = checks.filter(check => !check.healthy);
    
    for (const check of failedChecks) {
      await this.createAlert({
        checkName: check.name,
        severity: 'critical',
        details: check.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
