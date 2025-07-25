'use server';

import React from 'react';
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
    const rawValue = result.value ? result.value[1] : '0';
    const value = parseFloat(rawValue);

    // Handle NaN values
    if (isNaN(value)) {
      return {
        name: query.name,
        value: 'No data',
        description: query.description,
        status: 'warning',
      };
    }

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

// NEW: Function to get platform-wide metrics for home dashboard
export async function getPlatformMetrics(): Promise<FormattedMetric[]> {
  try {
    // Get all available modules
    const moduleNames = [
      'authentication',
      'authorization',
      'database',
      'storage',
      'chat',
      'email',
      'sms',
      'router',
      'functions',
      'pushNotifications',
      'payments',
    ];

    // 1. Total Requests - Aggregate from all modules
    const totalRequests = await getTotalRequests(moduleNames);

    // 2. Average Response Time - Use system-wide latency
    const avgResponseTime = await getAverageResponseTime();

    // 3. Active Users - From authentication
    const activeUsers = await getActiveUsers();

    // 4. Error Rate - Aggregate from all modules
    const errorRate = await getErrorRate(moduleNames);

    // 5. Storage Usage - From storage metrics
    const storageUsage = await getStorageUsage();

    // 6. DB Connections - From database metrics
    const dbConnections = await getDatabaseConnections();

    return [
      totalRequests,
      avgResponseTime,
      activeUsers,
      errorRate,
      storageUsage,
      dbConnections,
    ];
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    // Return default metrics if there's an error
    return getDefaultPlatformMetrics();
  }
}

// Helper function to get total requests across all modules
async function getTotalRequests(
  moduleNames: string[]
): Promise<FormattedMetric> {
  try {
    // Use the HTTP request histogram for accurate total requests
    const query = await MetricQueries.totalHttpRequests();
    const metric = await getMetricValue(query);

    return {
      name: 'Total Requests',
      value: metric.value,
      unit: '/sec',
      description: 'Total HTTP requests per second across all modules',
      trend: 'stable',
      status: metric.status,
    };
  } catch (error) {
    return {
      name: 'Total Requests',
      value: '0',
      unit: '/sec',
      description: 'Total HTTP requests per second across all modules',
      status: 'warning',
    };
  }
}

// Helper function to get average response time
async function getAverageResponseTime(): Promise<FormattedMetric> {
  try {
    // Try the simple latency query first (more reliable)
    const simpleQuery = await MetricQueries.simpleHttpLatency();
    const simpleMetric = await getMetricValue(simpleQuery);

    // If simple query returns valid data, use it
    if (simpleMetric.value !== 'No data' && simpleMetric.value !== 'Error') {
      return {
        name: 'Avg Response Time',
        value: simpleMetric.value,
        unit: 'ms',
        description: 'Average HTTP response time across all modules',
        trend: 'stable',
        status: simpleMetric.status,
      };
    }

    // Fallback to histogram quantile
    const query = await MetricQueries.averageHttpLatency();
    const metric = await getMetricValue(query);

    return {
      name: 'Avg Response Time',
      value: metric.value,
      unit: 'ms',
      description: 'Average HTTP response time across all modules',
      trend: 'stable',
      status: metric.status,
    };
  } catch (error) {
    console.error('Error fetching average response time:', error);
    return {
      name: 'Avg Response Time',
      value: 'N/A',
      unit: 'ms',
      description: 'Average HTTP response time across all modules',
      status: 'warning',
    };
  }
}

// Helper function to get active users
async function getActiveUsers(): Promise<FormattedMetric> {
  try {
    const query = await MetricQueries.loggedInUsers();
    const metric = await getMetricValue(query);

    return {
      name: 'Active Users',
      value: metric.value,
      description: 'Number of currently logged-in users',
      trend: 'stable',
      status: metric.status,
    };
  } catch (error) {
    return {
      name: 'Active Users',
      value: 'N/A',
      description: 'Number of currently logged-in users',
      status: 'warning',
    };
  }
}

// Helper function to get error rate across all modules
async function getErrorRate(moduleNames: string[]): Promise<FormattedMetric> {
  try {
    // Get total HTTP errors (4xx and 5xx status codes)
    const errorQuery = await MetricQueries.httpErrorsByStatus();
    const errorMetric = await getMetricValue(errorQuery);
    const totalErrors = parseFloat(errorMetric.value) || 0;

    // Get total HTTP requests
    const requestQuery = await MetricQueries.totalHttpRequests();
    const requestMetric = await getMetricValue(requestQuery);
    const totalRequests = parseFloat(requestMetric.value) || 1;

    // Calculate error rate as percentage
    const errorRate = (totalErrors / totalRequests) * 100;

    return {
      name: 'Error Rate',
      value: formatValue(errorRate, 'percentage'),
      unit: '%',
      description: 'HTTP error rate across all modules',
      trend: 'stable',
      status:
        errorRate < 1 ? 'healthy' : errorRate < 5 ? 'warning' : 'critical',
    };
  } catch (error) {
    return {
      name: 'Error Rate',
      value: 'N/A',
      unit: '%',
      description: 'HTTP error rate across all modules',
      status: 'warning',
    };
  }
}

// Helper function to get storage usage
async function getStorageUsage(): Promise<FormattedMetric> {
  try {
    const query = await MetricQueries.totalStorageSize();
    const metric = await getMetricValue(query);

    return {
      name: 'Storage Usage',
      value: metric.value,
      unit: 'GB',
      description: 'Total storage usage',
      trend: 'stable',
      status: metric.status,
    };
  } catch (error) {
    return {
      name: 'Storage Usage',
      value: 'N/A',
      unit: 'GB',
      description: 'Total storage usage',
      status: 'warning',
    };
  }
}

// Helper function to get database connections
async function getDatabaseConnections(): Promise<FormattedMetric> {
  try {
    // Use active resources as a proxy for DB connections
    const query = await MetricQueries.activeResources();
    const metric = await getMetricValue(query);

    return {
      name: 'DB Connections',
      value: metric.value,
      description: 'Active database connections',
      trend: 'stable',
      status: metric.status,
    };
  } catch (error) {
    return {
      name: 'DB Connections',
      value: 'N/A',
      description: 'Active database connections',
      status: 'warning',
    };
  }
}

// Helper function to get default metrics when real data is unavailable
function getDefaultPlatformMetrics(): FormattedMetric[] {
  return [
    {
      name: 'Total Requests',
      value: '0',
      unit: '/sec',
      description: 'Total requests per second across all modules',
      status: 'warning',
    },
    {
      name: 'Avg Response Time',
      value: 'N/A',
      unit: 'ms',
      description: 'Average response time across the platform',
      status: 'warning',
    },
    {
      name: 'Active Users',
      value: 'N/A',
      description: 'Number of currently logged-in users',
      status: 'warning',
    },
    {
      name: 'Error Rate',
      value: 'N/A',
      unit: '%',
      description: 'Error rate across all modules',
      status: 'warning',
    },
    {
      name: 'Storage Usage',
      value: 'N/A',
      unit: 'GB',
      description: 'Total storage usage',
      status: 'warning',
    },
    {
      name: 'DB Connections',
      value: 'N/A',
      description: 'Active database connections',
      status: 'warning',
    },
  ];
}

// NEW: Function to get all module statuses for the home dashboard
export async function getAllModuleStatuses(): Promise<
  Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    requests: string;
    iconName: string;
    href: string;
  }>
> {
  const moduleConfigs = [
    {
      name: 'authentication',
      displayName: 'Authentication',
      href: '/authentication',
    },
    { name: 'database', displayName: 'Database', href: '/database' },
    { name: 'email', displayName: 'Email', href: '/email' },
    { name: 'storage', displayName: 'Storage', href: '/storage' },
    { name: 'functions', displayName: 'Functions', href: '/functions' },
    { name: 'chat', displayName: 'Chat', href: '/chat' },
    { name: 'sms', displayName: 'SMS', href: '/sms' },
    {
      name: 'pushNotifications',
      displayName: 'Push Notifications',
      href: '/push-notifications',
    },
    { name: 'payments', displayName: 'Payments', href: '/payments' },
    { name: 'router', displayName: 'Router', href: '/router' },
  ];

  const statuses = await Promise.all(
    moduleConfigs.map(async config => {
      try {
        const status = await getModuleStatus(config.name);
        const uptime = await getModuleUptime(config.name);
        const requests = await getModuleRequestRate(config.name);

        return {
          name: config.displayName,
          status,
          uptime,
          requests,
          iconName: config.name,
          href: config.href,
        };
      } catch (error) {
        return {
          name: config.displayName,
          status: 'unknown' as any,
          uptime: 'Unknown',
          requests: '0/sec',
          iconName: config.name,
          href: config.href,
        };
      }
    })
  );

  return statuses;
}

// Helper function to get module request rate
async function getModuleRequestRate(moduleName: string): Promise<string> {
  try {
    // Use HTTP requests filtered by route path for the specific module
    const query = await MetricQueries.httpRequestsForModule(moduleName);
    const metric = await getMetricValue(query);
    return `${metric.value}`;
  } catch (error) {
    return '0/sec';
  }
}

// Chart data functions for system performance charts
export async function getRequestVolumeChart(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
): Promise<MetricChartData> {
  try {
    const query = await MetricQueries.totalHttpRequests();
    const end = Math.floor(Date.now() / 1000);
    const start = end - getTimeRangeSeconds(timeRange);
    const step = getStepForTimeRange(timeRange);
    return await getMetricChart(query, start, end, step);
  } catch (error) {
    console.error('Error fetching request volume chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function getResponseTimeChart(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
): Promise<MetricChartData> {
  try {
    const query = await MetricQueries.simpleHttpLatency();
    const end = Math.floor(Date.now() / 1000);
    const start = end - getTimeRangeSeconds(timeRange);
    const step = getStepForTimeRange(timeRange);
    return await getMetricChart(query, start, end, step);
  } catch (error) {
    console.error('Error fetching response time chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function getErrorRateChart(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
): Promise<MetricChartData> {
  try {
    const query = await MetricQueries.httpErrorsByStatus();
    const end = Math.floor(Date.now() / 1000);
    const start = end - getTimeRangeSeconds(timeRange);
    const step = getStepForTimeRange(timeRange);
    return await getMetricChart(query, start, end, step);
  } catch (error) {
    console.error('Error fetching error rate chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function getSystemResourcesChart(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
): Promise<{
  cpu: MetricChartData;
  memory: MetricChartData;
}> {
  try {
    const cpuQuery = await MetricQueries.cpuUsage();
    const memoryQuery = await MetricQueries.memoryUsage();
    const end = Math.floor(Date.now() / 1000);
    const start = end - getTimeRangeSeconds(timeRange);
    const step = getStepForTimeRange(timeRange);

    const [cpu, memory] = await Promise.all([
      getMetricChart(cpuQuery, start, end, step),
      getMetricChart(memoryQuery, start, end, step),
    ]);

    return { cpu, memory };
  } catch (error) {
    console.error('Error fetching system resources chart data:', error);
    return {
      cpu: { timestamps: [], values: [], labels: [] },
      memory: { timestamps: [], values: [], labels: [] },
    };
  }
}

// Helper functions for time ranges
function getTimeRangeSeconds(timeRange: '1h' | '6h' | '24h' | '7d'): number {
  switch (timeRange) {
    case '1h':
      return 60 * 60;
    case '6h':
      return 6 * 60 * 60;
    case '24h':
      return 24 * 60 * 60;
    case '7d':
      return 7 * 24 * 60 * 60;
    default:
      return 60 * 60;
  }
}

function getStepForTimeRange(timeRange: '1h' | '6h' | '24h' | '7d'): string {
  switch (timeRange) {
    case '1h':
      return '1m';
    case '6h':
      return '5m';
    case '24h':
      return '15m';
    case '7d':
      return '1h';
    default:
      return '1m';
  }
}

// NEW: Function to get platform overview data
export async function getPlatformOverview(): Promise<{
  overallStatus: 'healthy' | 'warning' | 'critical';
  uptime: string;
  activeModules: number;
  totalModules: number;
  platformVersion: string;
}> {
  const moduleNames = [
    'authentication',
    'authorization',
    'database',
    'storage',
    'chat',
    'email',
    'sms',
    'router',
    'functions',
    'pushNotifications',
    'payments',
  ];
  try {
    // Get status of all modules
    const moduleStatuses = await Promise.all(
      moduleNames.map(async moduleName => {
        try {
          return await getModuleStatus(moduleName);
        } catch {
          return 'unknown';
        }
      })
    );

    // Calculate overall status
    const criticalCount = moduleStatuses.filter(s => s === 'critical').length;
    const warningCount = moduleStatuses.filter(s => s === 'warning').length;
    const healthyCount = moduleStatuses.filter(s => s === 'healthy').length;

    let overallStatus: 'healthy' | 'warning' | 'critical';
    if (criticalCount > 0) {
      overallStatus = 'critical';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'healthy';
    }

    // Get average uptime
    const uptimes = await Promise.all(
      moduleNames.map(async moduleName => {
        try {
          const uptime = await getModuleUptime(moduleName);
          return parseFloat(uptime.replace('%', '')) || 0;
        } catch {
          return 0;
        }
      })
    );

    const avgUptime =
      uptimes.reduce((sum, uptime) => sum + uptime, 0) / uptimes.length;

    return {
      overallStatus,
      uptime: `${avgUptime.toFixed(1)}%`,
      activeModules: healthyCount,
      totalModules: moduleNames.length,
      platformVersion: '1.0.0', // This could be fetched from a config or API
    };
  } catch (error) {
    return {
      overallStatus: 'warning',
      uptime: 'Unknown',
      activeModules: 0,
      totalModules: moduleNames.length,
      platformVersion: '1.0.0',
    };
  }
}

export async function fetchRequestVolumeChartAction(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
) {
  try {
    return await getRequestVolumeChart(timeRange);
  } catch (error) {
    console.error('Error fetching request volume chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function fetchResponseTimeChartAction(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
) {
  try {
    return await getResponseTimeChart(timeRange);
  } catch (error) {
    console.error('Error fetching response time chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function fetchErrorRateChartAction(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
) {
  try {
    return await getErrorRateChart(timeRange);
  } catch (error) {
    console.error('Error fetching error rate chart data:', error);
    return { timestamps: [], values: [], labels: [] };
  }
}

export async function fetchSystemResourcesChartAction(
  timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
) {
  try {
    return await getSystemResourcesChart(timeRange);
  } catch (error) {
    console.error('Error fetching system resources chart data:', error);
    return {
      cpu: { timestamps: [], values: [], labels: [] },
      memory: { timestamps: [], values: [], labels: [] },
    };
  }
}
