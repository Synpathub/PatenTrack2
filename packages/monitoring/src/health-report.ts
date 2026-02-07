import * as fs from 'fs/promises';
import * as path from 'path';
import type { HealthCheckResult } from './health-checker';

export async function generateHealthReport(result: HealthCheckResult): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const reportDir = path.join(process.cwd(), 'infrastructure', 'monitoring', 'reports');
  const reportPath = path.join(reportDir, `${date}-health-report.json`);

  const report = {
    date,
    timestamp: result.timestamp,
    healthy: result.healthy,
    checks: result.checks,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };

  try {
    await fs.mkdir(reportDir, { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Health report generated: ${reportPath}`);
  } catch (error) {
    console.error('Failed to generate health report:', error);
  }
}
