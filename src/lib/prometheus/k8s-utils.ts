'use server';

import { cookies } from 'next/headers';
import { _getEnv } from '@/lib/logic/EnvManager';

/**
 * Kubernetes utility functions for Prometheus label management
 */

export interface KubernetesLabels {
  namespace?: string;
  cluster?: string;
}

/**
 * Get Kubernetes labels from environment variables
 */
export async function getKubernetesLabelsFromEnv(): Promise<KubernetesLabels> {
  const envCookie = (await cookies()).get('activeEnv');
  const envDetails = await _getEnv(envCookie?.value ?? 'Local');

  return {
    namespace: envDetails.namespace,
    cluster: envDetails.cluster,
  };
}

/**
 * Check if running in a Kubernetes environment
 */
export async function isKubernetesEnvironment(): Promise<boolean> {
  const labels = await getKubernetesLabelsFromEnv();
  return Object.values(labels).some(value => value !== undefined);
}

/**
 * Build Prometheus label selector string from Kubernetes labels
 */
export async function buildKubernetesLabelSelector(
  labels: KubernetesLabels
): Promise<string> {
  const labelPairs: string[] = [];

  Object.entries(labels).forEach(([key, value]) => {
    if (value) {
      labelPairs.push(`${key}="${value}"`);
    }
  });

  return labelPairs.length > 0 ? `{${labelPairs.join(',')}}` : '';
}

/**
 * Get Kubernetes labels as a record for Prometheus queries
 */
export async function getKubernetesLabelsRecord(): Promise<
  Record<string, string>
> {
  const labels = await getKubernetesLabelsFromEnv();
  const record: Record<string, string> = {};

  Object.entries(labels).forEach(([key, value]) => {
    if (value) {
      record[key] = value;
    }
  });

  return record;
}

/**
 * Validate Kubernetes environment variables
 */
export async function validateKubernetesEnvironment(): Promise<{
  isValid: boolean;
  labels: KubernetesLabels;
  warnings: string[];
  suggestions: string[];
}> {
  const labels = await getKubernetesLabelsFromEnv();
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if we're in a Kubernetes environment
  const isK8s = await isKubernetesEnvironment();

  if (isK8s) {
    // Suggest setting namespace if not provided
    if (!labels.namespace) {
      suggestions.push(
        'Consider setting KUBERNETES_NAMESPACE for better metric filtering'
      );
    }

    // Suggest setting cluster if not provided
    if (!labels.cluster) {
      suggestions.push(
        'Consider setting KUBERNETES_CLUSTER for multi-cluster environments'
      );
    }
  } else {
    warnings.push(
      'No Kubernetes environment variables detected. Set KUBERNETES_NAMESPACE, KUBERNETES_CLUSTER, etc. for Kubernetes-specific filtering.'
    );
  }

  return {
    isValid: true, // Always valid, just provides suggestions
    labels,
    warnings,
    suggestions,
  };
}

/**
 * Get Kubernetes deployment information for display
 */
export async function getKubernetesDeploymentInfo(): Promise<{
  namespace: string | null;
  cluster: string | null;
  isKubernetes: boolean;
}> {
  const labels = await getKubernetesLabelsFromEnv();

  return {
    namespace: labels.namespace || null,
    cluster: labels.cluster || null,
    isKubernetes: await isKubernetesEnvironment(),
  };
}

/**
 * Create a human-readable description of the Kubernetes environment
 */
export async function getKubernetesEnvironmentDescription(): Promise<string> {
  const info = await getKubernetesDeploymentInfo();

  if (!info.isKubernetes) {
    return 'Not running in Kubernetes environment';
  }

  const parts: string[] = [];

  if (info.cluster) {
    parts.push(`Cluster: ${info.cluster}`);
  }

  if (info.namespace) {
    parts.push(`Namespace: ${info.namespace}`);
  }

  return parts.length > 0
    ? parts.join(', ')
    : 'Kubernetes environment (no specific labels)';
}
