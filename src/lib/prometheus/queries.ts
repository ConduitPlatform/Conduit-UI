'use server';

import { _getEnv } from '@/lib/logic/EnvManager';
import { getKubernetesLabelsRecord } from './k8s-utils';

export interface MetricQuery {
  name: string;
  expression: string;
  description: string;
  unit?: string;
  format?:
    | 'number'
    | 'percentage'
    | 'duration'
    | 'bytes'
    | 'requests_per_second';
}

// Helper functions
async function getNamespace(): Promise<string | undefined> {
  const envDetails = await _getEnv();
  return envDetails.namespace;
}

async function getKubernetesLabels(): Promise<Record<string, string>> {
  return getKubernetesLabelsRecord();
}

async function buildLabels(
  additionalLabels?: Record<string, string>
): Promise<string> {
  const k8sLabels = await getKubernetesLabels();
  const labels: string[] = [];

  // Add Kubernetes labels if available
  Object.entries(k8sLabels).forEach(([key, value]) => {
    labels.push(`${key}="${value}"`);
  });

  // Add additional labels
  if (additionalLabels) {
    Object.entries(additionalLabels).forEach(([key, value]) => {
      labels.push(`${key}="${value}"`);
    });
  }

  return labels.length > 0 ? `{${labels.join(',')}}` : '';
}

// Exported async functions
export async function moduleRequests(moduleName: string): Promise<MetricQuery> {
  const labels = await buildLabels({ module_name: moduleName });
  return {
    name: 'Requests per Second',
    expression: `rate(cnd_${moduleName}_requests_total${labels}[5m])`,
    description: `Rate of requests for ${moduleName} module`,
    format: 'requests_per_second',
  };
}

export async function moduleErrors(moduleName: string): Promise<MetricQuery> {
  const labels = await buildLabels({ module_name: moduleName });
  return {
    name: 'Error Rate',
    expression: `rate(cnd_${moduleName}_errors_total${labels}[5m])`,
    description: `Rate of errors for ${moduleName} module`,
    format: 'requests_per_second',
  };
}

export async function moduleLatency(moduleName: string): Promise<MetricQuery> {
  const labels = await buildLabels({ module_name: moduleName });
  return {
    name: '95th Percentile Latency',
    expression: `histogram_quantile(0.95, rate(cnd_${moduleName}_request_duration_seconds_bucket${labels}[5m]))`,
    description: `95th percentile latency for ${moduleName} module`,
    format: 'duration',
  };
}

export async function moduleHealth(moduleName: string): Promise<MetricQuery> {
  const labels = await buildLabels({ module_name: moduleName });
  return {
    name: 'Module Health',
    expression: `cnd_module_health_state${labels}`,
    description: `Health state of ${moduleName} module`,
  };
}

// HTTP request metrics (filtered by module)
export async function httpRequestsByModule(
  moduleName: string
): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'HTTP Requests',
    expression: `rate(http_request_duration_seconds_count${labels}[5m])`,
    description: `HTTP requests for ${moduleName} module`,
    format: 'requests_per_second',
  };
}

export async function httpErrorsByModule(
  moduleName: string
): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'HTTP Errors',
    expression: `rate(http_request_duration_seconds_count${labels}[5m])`,
    description: `HTTP errors for ${moduleName} module`,
    format: 'requests_per_second',
  };
}

export async function httpLatencyByModule(
  moduleName: string
): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'HTTP Latency',
    expression: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket${labels}[5m]))`,
    description: `HTTP latency for ${moduleName} module`,
    format: 'duration',
  };
}

// gRPC metrics
export async function grpcRequests(moduleName?: string): Promise<MetricQuery> {
  const labels = await buildLabels(
    moduleName ? { module_name: moduleName } : undefined
  );
  return {
    name: 'gRPC Requests',
    expression: `rate(cnd_admin_grpc_requests_total${labels}[5m]) + rate(cnd_client_grpc_requests_total${labels}[5m])`,
    description: 'Total gRPC requests per second',
    format: 'requests_per_second',
  };
}

export async function grpcErrors(moduleName?: string): Promise<MetricQuery> {
  const labels = await buildLabels(
    moduleName ? { module_name: moduleName } : undefined
  );
  return {
    name: 'gRPC Errors',
    expression: `rate(cnd_admin_grpc_errors_total${labels}[5m]) + rate(cnd_client_grpc_errors_total${labels}[5m])`,
    description: 'Total gRPC errors per second',
    format: 'requests_per_second',
  };
}

export async function grpcLatency(moduleName?: string): Promise<MetricQuery> {
  const labels = await buildLabels(
    moduleName ? { module_name: moduleName } : undefined
  );
  return {
    name: 'gRPC Latency',
    expression: `cnd_grpc_request_latency_seconds${labels}`,
    description: 'gRPC request latency',
    format: 'duration',
  };
}

// System metrics
export async function cpuUsage(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'CPU Usage',
    expression: `rate(cnd_process_cpu_seconds_total${labels}[5m]) * 100`,
    description: 'CPU usage percentage',
    format: 'percentage',
  };
}

export async function memoryUsage(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Memory Usage',
    expression: `cnd_process_resident_memory_bytes${labels}`,
    description: 'Memory usage in bytes',
    format: 'bytes',
  };
}

export async function heapUsage(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Heap Usage',
    expression: `cnd_nodejs_heap_size_used_bytes${labels}`,
    description: 'Node.js heap usage in bytes',
    format: 'bytes',
  };
}

export async function eventLoopLag(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Event Loop Lag',
    expression: `cnd_nodejs_eventloop_lag_seconds${labels}`,
    description: 'Node.js event loop lag in seconds',
    format: 'duration',
  };
}

// Uptime metrics
export async function processUptime(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Process Uptime',
    expression: `time() - process_start_time_seconds${labels}`,
    description: 'Process uptime in seconds',
    format: 'duration',
  };
}

export async function nodejsUptime(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Node.js Uptime',
    expression: `cnd_nodejs_uptime_seconds${labels}`,
    description: 'Node.js uptime in seconds',
    format: 'duration',
  };
}

export async function moduleUptime(moduleName: string): Promise<MetricQuery> {
  const labels = await buildLabels({ module_name: moduleName });
  return {
    name: 'Module Uptime',
    expression: `cnd_module_uptime_seconds${labels}`,
    description: `Uptime for ${moduleName} module in seconds`,
    format: 'duration',
  };
}

// Module-specific total counts
export async function totalSchemas(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Total Schemas',
    expression: `cnd_registered_schemas_total${labels}`,
    description: 'Total number of registered database schemas',
    format: 'number',
  };
}

export async function totalCustomEndpoints(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Total Custom Endpoints',
    expression: `cnd_custom_endpoints_total${labels}`,
    description: 'Total number of custom endpoints',
    format: 'number',
  };
}

export async function totalDatabaseQueries(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Database Queries',
    expression: `rate(cnd_database_queries_total${labels}[5m])`,
    description: 'Database queries per second',
    format: 'requests_per_second',
  };
}

export async function totalStorageSize(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Storage Size',
    expression: `cnd_storage_size_bytes_total${labels}`,
    description: 'Total storage size in bytes',
    format: 'bytes',
  };
}

export async function totalFiles(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Total Files',
    expression: `cnd_files_total${labels}`,
    description: 'Total number of files',
    format: 'number',
  };
}

export async function totalFolders(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Total Folders',
    expression: `cnd_folders_total${labels}`,
    description: 'Total number of folders',
    format: 'number',
  };
}

export async function totalContainers(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Total Containers',
    expression: `cnd_containers_total${labels}`,
    description: 'Total number of storage containers',
    format: 'number',
  };
}

// Authentication specific metrics
export async function loggedInUsers(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Logged In Users',
    expression: `cnd_logged_in_users_total${labels}`,
    description: 'Total number of logged in users',
    format: 'number',
  };
}

export async function loginRequests(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Login Requests',
    expression: `rate(cnd_login_requests_total${labels}[5m])`,
    description: 'Login requests per second',
    format: 'requests_per_second',
  };
}

export async function authorizationRoles(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Authorization Roles',
    expression: `cnd_authorization_roles_total${labels}`,
    description: 'Total number of authorization roles',
    format: 'number',
  };
}

export async function authorizationRules(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Authorization Rules',
    expression: `cnd_authorization_rules_total${labels}`,
    description: 'Total number of authorization rules',
    format: 'number',
  };
}

export async function authorizationDenials(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Authorization Denials',
    expression: `cnd_authorization_denials${labels}`,
    description: 'Number of authorization denials',
    format: 'number',
  };
}

// Chat specific metrics
export async function chatRooms(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Chat Rooms',
    expression: `cnd_chat_rooms_total${labels}`,
    description: 'Total number of chat rooms',
    format: 'number',
  };
}

export async function messagesSent(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Messages Sent',
    expression: `rate(cnd_messages_sent_total${labels}[5m])`,
    description: 'Messages sent per second',
    format: 'requests_per_second',
  };
}

// Email specific metrics
export async function emailsSent(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Emails Sent',
    expression: `rate(cnd_emails_sent_total${labels}[5m])`,
    description: 'Emails sent per second',
    format: 'requests_per_second',
  };
}

export async function emailTemplates(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Email Templates',
    expression: `cnd_email_templates_total${labels}`,
    description: 'Total number of email templates',
    format: 'number',
  };
}

// Push notifications specific metrics
export async function pushNotificationsSent(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Push Notifications Sent',
    expression: `rate(cnd_push_notifications_sent_total${labels}[5m])`,
    description: 'Push notifications sent per second',
    format: 'requests_per_second',
  };
}

// Route metrics
export async function adminRoutes(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Admin Routes',
    expression: `cnd_admin_routes_total${labels}`,
    description: 'Total number of admin routes',
    format: 'number',
  };
}

export async function clientRoutes(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Client Routes',
    expression: `cnd_client_routes_total${labels}`,
    description: 'Total number of client routes',
    format: 'number',
  };
}

// Active resources
export async function activeRequests(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Active Requests',
    expression: `cnd_nodejs_active_requests${labels}`,
    description: 'Number of active requests',
    format: 'number',
  };
}

export async function activeHandles(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Active Handles',
    expression: `cnd_nodejs_active_handles${labels}`,
    description: 'Number of active handles',
    format: 'number',
  };
}

export async function activeResources(): Promise<MetricQuery> {
  const labels = await buildLabels();
  return {
    name: 'Active Resources',
    expression: `cnd_nodejs_active_resources${labels}`,
    description: 'Number of active resources',
    format: 'number',
  };
}
