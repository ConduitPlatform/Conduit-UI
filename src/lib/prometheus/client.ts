'use server';

import axios, { AxiosInstance } from 'axios';
import { cookies } from 'next/headers';
import { _getEnv } from '@/lib/logic/EnvManager';
import { ClientSecretCredential } from '@azure/identity';

export interface PrometheusConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  useAzureAuth?: boolean;
  azureTenantId?: string;
  azureClientId?: string;
  azureClientSecret?: string;
}

export interface MetricData {
  resultType: string;
  result: Array<{
    metric: Record<string, string>;
    value?: [number, string];
    values?: Array<[number, string]>;
  }>;
}

export interface MetricMetadata {
  type: string;
  help: string;
  unit?: string;
}

// Helper function to get Azure token using App Registration
async function getAzureAppRegistrationToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  resourceId?: string
): Promise<string | null> {
  try {
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );
    const token = await credential.getToken(
      'https://prometheus.monitor.azure.com/.default'
    );
    return token?.token || null;
  } catch (error) {
    console.error('Error getting Azure App Registration token:', error);
    return null;
  }
}

// Helper function to get Azure token based on configuration
async function getAzureToken(config: PrometheusConfig): Promise<string | null> {
  if (
    config.azureTenantId &&
    config.azureClientId &&
    config.azureClientSecret
  ) {
    return await getAzureAppRegistrationToken(
      config.azureTenantId,
      config.azureClientId,
      config.azureClientSecret
    );
  }
  return null;
}

// Helper function to create axios client with authentication
async function createAuthenticatedClient(
  config: PrometheusConfig
): Promise<AxiosInstance> {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Add authentication interceptor
  client.interceptors.request.use(async requestConfig => {
    if (config.useAzureAuth) {
      // For Azure authentication, get the token
      const token = await getAzureToken(config);
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.username && config.password) {
      // Basic authentication
      const auth = Buffer.from(
        `${config.username}:${config.password}`
      ).toString('base64');
      requestConfig.headers.Authorization = `Basic ${auth}`;
    }
    return requestConfig;
  });

  return client;
}

// Exported async functions
export async function queryRange(
  config: PrometheusConfig,
  expression: string,
  start: number,
  end: number,
  step: string
): Promise<MetricData> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get('/api/v1/query_range', {
    params: {
      query: expression,
      start: start,
      end: end,
      step: step,
    },
  });
  return response.data.data;
}

export async function instantQuery(
  config: PrometheusConfig,
  expression: string
): Promise<MetricData> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get('/api/v1/query', {
    params: {
      query: expression,
    },
  });
  return response.data.data;
}

export async function getMetricMetadata(
  config: PrometheusConfig,
  metricName: string
): Promise<MetricMetadata[]> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get('/api/v1/metadata', {
    params: {
      metric: metricName,
    },
  });
  return response.data.data;
}

export async function getSeries(
  config: PrometheusConfig,
  matchers?: string[]
): Promise<Array<Record<string, string>>> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get('/api/v1/series', {
    params: {
      match: matchers,
    },
  });
  return response.data.data;
}

export async function getLabels(config: PrometheusConfig): Promise<string[]> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get('/api/v1/labels');
  return response.data.data;
}

export async function getLabelValues(
  config: PrometheusConfig,
  label: string
): Promise<string[]> {
  const client = await createAuthenticatedClient(config);
  const response = await client.get(`/api/v1/label/${label}/values`);
  return response.data.data;
}

// Factory function to create Prometheus client from environment
export async function createPrometheusClient(
  env?: string
): Promise<PrometheusConfig> {
  const envCookie = (await cookies()).get('activeEnv');
  const envDetails = await _getEnv(env ?? envCookie?.value ?? 'Local');

  // For local development, use localhost:9090
  const baseUrl = envDetails.promUrl || 'http://localhost:9090';

  // Check if we should use Azure Auth
  const useAzureAuth = envDetails.azAuth === 'true';

  // For local development, we might not need authentication
  const username = envDetails.promUsername;
  const password = envDetails.promPassword;

  // Azure App Registration configuration
  const azureTenantId = envDetails.azTenantId;
  const azureClientId = envDetails.azClientId;
  const azureClientSecret = envDetails.azClientSecret;
  return {
    baseUrl,
    username,
    password,
    useAzureAuth,
    azureTenantId,
    azureClientId,
    azureClientSecret,
  };
}
