import { loadConfig, createLogger } from '@patentrack/shared';
import { runHealthChecks } from './health-checker';
import { GitHubReporter } from './github-reporter';
import { generateHealthReport } from './health-report';

const logger = createLogger('monitoring');

async function main() {
  try {
    loadConfig();
    logger.info('Starting health check...');

    const result = await runHealthChecks();
    logger.info({ result }, 'Health check completed');

    // Generate daily report
    await generateHealthReport(result);

    // Create GitHub issues for failures
    if (!result.healthy) {
      const reporter = new GitHubReporter();
      await reporter.reportFailedChecks(result.checks);
    }

    process.exit(result.healthy ? 0 : 1);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    process.exit(1);
  }
}

main();

export * from './health-checker';
export * from './github-reporter';
export * from './health-report';
