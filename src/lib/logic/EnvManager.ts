'use server';

import { isEmpty } from 'lodash';
import { cookies } from 'next/headers';

export interface Environment {
  name: string;
  baseUrl: string;
  masterKey: string;
  lokiUrl?: string;
  promUrl?: string;
  namespace?: string;
  cluster?: string;
  azAuth?: string;
  promUsername?: string;
  promPassword?: string;
  azTenantId?: string;
  azClientId?: string;
  azClientSecret?: string;
}

export interface EnvironmentConfig {
  mode: 'single' | 'multi';
  defaultEnvironment: string;
  environments: Environment[];
}

// Global cache for configuration
let configCache: EnvironmentConfig | null = null;

/**
 * Get the environment configuration
 */
export async function getConfig(): Promise<EnvironmentConfig> {
  if (configCache) {
    return configCache;
  }

  const mode = process.env.ENVIRONMENT_MODE || 'single';
  const defaultEnvironment = process.env.DEFAULT_ENVIRONMENT || 'Local';

  if (mode === 'single') {
    configCache = await getSingleEnvironmentConfig(defaultEnvironment);
  } else {
    configCache = await getMultiEnvironmentConfig();
  }

  return configCache;
}

/**
 * Get configuration for single environment mode
 */
async function getSingleEnvironmentConfig(
  envName: string
): Promise<EnvironmentConfig> {
  const environment: Environment = {
    name: envName,
    baseUrl: process.env.API_BASE_URL!,
    masterKey: process.env.MASTER_KEY!,
    lokiUrl: process.env.LOKI_URL,
    promUrl: process.env.PROMETHEUS_URL,
    namespace: process.env.NAMESPACE,
    cluster: process.env.CLUSTER,
    azAuth: process.env.PROM_AZ_AUTH,
    promUsername: process.env.PROM_USERNAME,
    promPassword: process.env.PROM_PASSWORD,
    azTenantId: process.env.AZ_TENANT_ID,
    azClientId: process.env.AZ_CLIENT_ID,
    azClientSecret: process.env.AZ_CLIENT_SECRET,
  };

  return {
    mode: 'single',
    defaultEnvironment: envName,
    environments: [environment],
  };
}

/**
 * Get configuration for multi-environment mode
 */
async function getMultiEnvironmentConfig(): Promise<EnvironmentConfig> {
  const environments: Environment[] = [];
  const defaultEnvironment = process.env.DEFAULT_ENVIRONMENT || 'production';

  // Get all environment variables
  const envVars = process.env;
  const environmentNames = new Set<string>();

  // Find all environment names from prefixed variables
  Object.keys(envVars).forEach(key => {
    if (key.includes('_API_BASE_URL')) {
      const envName = key.replace('_API_BASE_URL', '');
      if (envName) {
        environmentNames.add(envName);
      }
    }
  });

  // Build environment configurations
  environmentNames.forEach(envName => {
    const prefix = envName.toUpperCase();
    const environment: Environment = {
      name: envName,
      baseUrl: envVars[`${prefix}_API_BASE_URL`]!,
      masterKey: envVars[`${prefix}_MASTER_KEY`]!,
      lokiUrl: envVars[`${prefix}_LOKI_URL`],
      promUrl: envVars[`${prefix}_PROMETHEUS_URL`],
      namespace: envVars[`${prefix}_NAMESPACE`],
      cluster: envVars[`${prefix}_CLUSTER`],
      azAuth: envVars[`${prefix}_AZ_AUTH`],
      promUsername: envVars[`${prefix}_PROM_USERNAME`],
      promPassword: envVars[`${prefix}_PROM_PASSWORD`],
      azTenantId: envVars[`${prefix}_AZ_TENANT_ID`],
      azClientId: envVars[`${prefix}_AZ_CLIENT_ID`],
      azClientSecret: envVars[`${prefix}_AZ_CLIENT_SECRET`],
    };

    // Validate required fields
    if (!environment.baseUrl || !environment.masterKey) {
      console.warn(
        `Environment ${envName} is missing required fields (baseUrl or masterKey)`
      );
      return;
    }

    environments.push(environment);
  });

  if (environments.length === 0) {
    throw new Error('No valid environments found in multi-environment mode');
  }

  return {
    mode: 'multi',
    defaultEnvironment,
    environments,
  };
}

/**
 * Get all available environments
 */
export async function getEnvironments(): Promise<Environment[]> {
  const config = await getConfig();
  return config.environments;
}

/**
 * Get environment names
 */
export async function getEnvironmentNames(): Promise<string[]> {
  const environments = await getEnvironments();
  return environments.map(env => env.name);
}

/**
 * Get current active environment
 */
export async function getCurrentEnvironment(): Promise<Environment> {
  const config = await getConfig();
  const cookie = (await cookies()).get('activeEnv');
  const activeEnvName = cookie?.value || config.defaultEnvironment;

  const environment = config.environments.find(
    env => env.name === activeEnvName
  );
  if (!environment) {
    throw new Error(`Environment '${activeEnvName}' not found`);
  }

  return environment;
}

/**
 * Get environment by name
 */
export async function getEnvironment(name: string): Promise<Environment> {
  const environments = await getEnvironments();
  const environment = environments.find(
    env => env.name.toLowerCase() === name.toLowerCase()
  );
  if (!environment) {
    throw new Error(`Environment '${name}' not found`);
  }
  return environment;
}

/**
 * Check if Loki is enabled for current environment
 */
export async function isLokiEnabled(): Promise<boolean> {
  const env = await getCurrentEnvironment();
  return !!env.lokiUrl;
}

/**
 * Validate environment configuration
 */
export async function validateConfig(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const config = await getConfig();

    if (config.environments.length === 0) {
      errors.push('No environments configured');
    }

    config.environments.forEach(env => {
      if (!env.baseUrl) {
        errors.push(`Environment '${env.name}' missing baseUrl`);
      }
      if (!env.masterKey) {
        errors.push(`Environment '${env.name}' missing masterKey`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(
      `Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return {
      valid: false,
      errors,
    };
  }
}

// Backward compatibility functions
export const _getEnvs = async (): Promise<Environment[]> => {
  return getEnvironments();
};

export const getEnvNames = async (): Promise<string[]> => {
  return getEnvironmentNames();
};

export const getEnvName = async (): Promise<string> => {
  const env = await getCurrentEnvironment();
  return env.name;
};

export const _getEnv = async (env?: string): Promise<Environment> => {
  if (env) {
    return getEnvironment(env);
  }
  return getCurrentEnvironment();
};
