'use server';

import { createPrometheusClient, instantQuery, queryRange } from './client';
import * as MetricQueries from './queries';

export interface FormattedMetric {
  name: string;
  value: string;
  unit?: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'healthy' | 'warning' | 'critical';
}

export interface MetricChartData {
  timestamps: number[];
  values: number[];
  labels: string[];
}

// Helper functions
async function getMetricValue(query: any): Promise<FormattedMetric> {
  try {
    const config = await createPrometheusClient();
    const data = await instantQuery(config, query.expression);

    if (!data.result || data.result.length === 0) {
      return {
        name: query.name,
        value: 'No data',
        description: query.description,
        status: 'warning',
      };
    }

    const result = data.result[0];
    const value = result.value ? parseFloat(result.value[1]) : 0;

    return {
      name: query.name,
      value: formatValue(value, query.format),
      unit: query.unit,
      description: query.description,
      status: getStatus(value, query.name),
    };
  } catch (error) {
    console.error(`Error fetching metric ${query.name}:`, error);
    return {
      name: query.name,
      value: 'Error',
      description: query.description,
      status: 'critical',
    };
  }
}

async function getMetricChart(
  query: any,
  start: number,
  end: number,
  step: string = '1m'
): Promise<MetricChartData> {
  try {
    const config = await createPrometheusClient();
    const data = await queryRange(config, query.expression, start, end, step);

    if (!data.result || data.result.length === 0) {
      return {
        timestamps: [],
        values: [],
        labels: [],
      };
    }

    const result = data.result[0];
    const timestamps: number[] = [];
    const values: number[] = [];
    const labels: string[] = [];

    if (result.values) {
      result.values.forEach(([timestamp, value]) => {
        timestamps.push(timestamp * 1000); // Convert to milliseconds
        values.push(parseFloat(value));
        labels.push(new Date(timestamp * 1000).toLocaleTimeString());
      });
    }

    return { timestamps, values, labels };
  } catch (error) {
    console.error(`Error fetching chart data for ${query.name}:`, error);
    return {
      timestamps: [],
      values: [],
      labels: [],
    };
  }
}

function formatValue(value: number, format?: string): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'duration':
      return formatDuration(value);
    case 'bytes':
      return formatBytes(value);
    case 'requests_per_second':
      return `${value.toFixed(2)}/s`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(2)}ms`;
  } else if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function getStatus(
  value: number,
  metricName: string
): 'healthy' | 'warning' | 'critical' {
  // Define thresholds for different metrics
  const thresholds: Record<string, { warning: number; critical: number }> = {
    'Module Health': { warning: 0, critical: 0 },
    'Event Loop Lag': { warning: 100, critical: 500 }, // ms
    'CPU Usage': { warning: 80, critical: 95 }, // percentage
    'Memory Usage': { warning: 80, critical: 95 }, // percentage
    'Error Rate': { warning: 5, critical: 10 }, // errors per second
  };

  const threshold = thresholds[metricName];
  if (!threshold) {
    return 'healthy';
  }

  if (value >= threshold.critical) {
    return 'critical';
  } else if (value >= threshold.warning) {
    return 'warning';
  }

  return 'healthy';
}

// Exported async functions
export async function getModuleMetrics(
  moduleName: string
): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.moduleHealth(moduleName),
    await MetricQueries.moduleRequests(moduleName),
    await MetricQueries.moduleErrors(moduleName),
    await MetricQueries.moduleLatency(moduleName),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getSystemMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.cpuUsage(),
    await MetricQueries.memoryUsage(),
    await MetricQueries.heapUsage(),
    await MetricQueries.eventLoopLag(),
    await MetricQueries.activeRequests(),
    await MetricQueries.activeHandles(),
    await MetricQueries.activeResources(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getModuleUptime(moduleName: string): Promise<string> {
  try {
    // Try module-specific uptime first
    const moduleUptimeQuery = await MetricQueries.moduleUptime(moduleName);
    const moduleUptime = await getMetricValue(moduleUptimeQuery);

    if (moduleUptime.value !== 'No data' && moduleUptime.value !== 'Error') {
      return moduleUptime.value;
    }

    // Fallback to Node.js uptime
    const nodejsUptimeQuery = await MetricQueries.nodejsUptime();
    const nodejsUptime = await getMetricValue(nodejsUptimeQuery);

    if (nodejsUptime.value !== 'No data' && nodejsUptime.value !== 'Error') {
      return nodejsUptime.value;
    }

    // Fallback to process uptime
    const processUptimeQuery = await MetricQueries.processUptime();
    const processUptime = await getMetricValue(processUptimeQuery);

    if (processUptime.value !== 'No data' && processUptime.value !== 'Error') {
      return processUptime.value;
    }

    // If no uptime data available, return unknown
    return 'Unknown';
  } catch (error) {
    console.error(`Error fetching uptime for ${moduleName}:`, error);
    return 'Unknown';
  }
}

export async function getAuthenticationMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.loggedInUsers(),
    await MetricQueries.loginRequests(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getAuthorizationMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.authorizationRoles(),
    await MetricQueries.authorizationRules(),
    await MetricQueries.authorizationDenials(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getDatabaseMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.totalSchemas(),
    await MetricQueries.totalCustomEndpoints(),
    await MetricQueries.totalDatabaseQueries(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getStorageMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.totalStorageSize(),
    await MetricQueries.totalFiles(),
    await MetricQueries.totalFolders(),
    await MetricQueries.totalContainers(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getChatMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.chatRooms(),
    await MetricQueries.messagesSent(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getEmailMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.emailsSent(),
    await MetricQueries.emailTemplates(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getPushNotificationMetrics(): Promise<FormattedMetric[]> {
  const queries = [await MetricQueries.pushNotificationsSent()];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

export async function getRouterMetrics(): Promise<FormattedMetric[]> {
  const queries = [
    await MetricQueries.adminRoutes(),
    await MetricQueries.clientRoutes(),
    await MetricQueries.grpcRequests(),
    await MetricQueries.grpcErrors(),
    await MetricQueries.grpcLatency(),
  ];

  const metrics = await Promise.all(
    queries.map(query => getMetricValue(query))
  );

  return metrics;
}

// NEW: Function to determine overall module status
export async function getModuleStatus(
  moduleName: string
): Promise<'healthy' | 'warning' | 'critical' | 'unknown'> {
  try {
    // Get the module health state metric
    const moduleHealthQuery = await MetricQueries.moduleHealth(moduleName);
    const healthMetric = await getMetricValue(moduleHealthQuery);

    // If we have a valid health metric, use it
    if (healthMetric.value !== 'No data' && healthMetric.value !== 'Error') {
      const healthValue = parseFloat(healthMetric.value);
      // conduit_module_health_state: 0 = not healthy, 1 = healthy
      if (healthValue === 1) return 'healthy';
      if (healthValue === 0) return 'critical';
      return 'unknown'; // Any other value is unexpected
    }

    // Fallback: check error rate and other critical metrics
    const errorRateQuery = await MetricQueries.moduleErrors(moduleName);
    const errorMetric = await getMetricValue(errorRateQuery);

    if (errorMetric.status === 'critical') {
      return 'critical';
    } else if (errorMetric.status === 'warning') {
      return 'warning';
    }

    // If no health data and no critical issues found, assume unknown
    return 'unknown';
  } catch (error) {
    console.error(`Error determining status for ${moduleName}:`, error);
    return 'unknown';
  }
}
