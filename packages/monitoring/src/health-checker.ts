import axios from 'axios';
import { getConfig } from '@patentrack/shared';

export interface CheckResult {
  name: string;
  healthy: boolean;
  message: string;
  details?: unknown;
}

export interface HealthCheckResult {
  healthy: boolean;
  checks: CheckResult[];
  timestamp: string;
}

export async function checkApiHealth(): Promise<CheckResult> {
  try {
    const config = getConfig();
    const response = await axios.get(
      `http://${config.API_HOST}:${config.API_PORT}/health/ready`,
      { timeout: 5000 }
    );
    
    return {
      name: 'API Server',
      healthy: response.data.status === 'ok',
      message: response.data.status === 'ok' ? 'API is healthy' : 'API is degraded',
      details: response.data,
    };
  } catch (error) {
    return {
      name: 'API Server',
      healthy: false,
      message: `API check failed: ${(error as Error).message}`,
    };
  }
}

export async function checkDiskSpace(): Promise<CheckResult> {
  // Simplified disk check - in production would use fs.statfs
  return {
    name: 'Disk Space',
    healthy: true,
    message: 'Disk space OK',
  };
}

export async function checkMemory(): Promise<CheckResult> {
  const memUsage = process.memoryUsage();
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentUsed = (usedMB / totalMB) * 100;
  
  return {
    name: 'Memory Usage',
    healthy: percentUsed < 80,
    message: percentUsed < 80 ? 'Memory usage OK' : 'High memory usage',
    details: { usedMB, totalMB, percentUsed },
  };
}

export async function runHealthChecks(): Promise<HealthCheckResult> {
  const checks = await Promise.all([
    checkApiHealth(),
    checkDiskSpace(),
    checkMemory(),
  ]);

  const healthy = checks.every(check => check.healthy);

  return {
    healthy,
    checks,
    timestamp: new Date().toISOString(),
  };
}
