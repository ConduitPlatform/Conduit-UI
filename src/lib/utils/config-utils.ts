import { getModules } from '@/lib/api/modules';
import { Module } from '@/lib/models/Module';
import {
  CommunicationsConfig,
  CommunicationsModuleName,
} from '@/lib/models/communications';
import { COMMUNICATIONS_PROVIDED_MODULES } from '@/lib/utils/module-utils';

/**
 * Determines if a specific module's config should come from the communications module.
 * Returns true if the standalone module is not available but communications is.
 */
export async function isModuleProvidedByCommunications(
  moduleName: CommunicationsModuleName
): Promise<boolean> {
  const modules = await getModules();
  return checkIfProvidedByCommunications(modules, moduleName);
}

/**
 * Synchronous check if a module is provided by communications.
 * Use this when you already have the modules list.
 */
export function checkIfProvidedByCommunications(
  modules: Module[],
  moduleName: CommunicationsModuleName
): boolean {
  // Check if the module is in the list of modules that can be provided by communications
  if (!COMMUNICATIONS_PROVIDED_MODULES.includes(moduleName)) {
    return false;
  }

  // Check if the standalone module exists
  const hasStandaloneModule = modules.some(
    module => module.moduleName === moduleName
  );

  // If standalone module exists, use it directly
  if (hasStandaloneModule) {
    return false;
  }

  // Check if communications module exists
  const hasCommunications = modules.some(
    module => module.moduleName === 'communications'
  );

  return hasCommunications;
}

/**
 * Extracts specific module config from a communications config response.
 */
export function extractModuleConfigFromCommunications<T>(
  communicationsConfig: CommunicationsConfig,
  moduleName: CommunicationsModuleName
): T {
  switch (moduleName) {
    case 'email':
      return communicationsConfig.email as T;
    case 'sms':
      return communicationsConfig.sms as T;
    case 'pushNotifications':
      return communicationsConfig.pushNotifications as T;
    default:
      throw new Error(`Unknown module name: ${moduleName}`);
  }
}

/**
 * Gets the appropriate config endpoint path based on whether the module
 * is standalone or provided by communications.
 */
export async function getConfigEndpoint(
  moduleName: CommunicationsModuleName
): Promise<{ endpoint: string; isCommunications: boolean }> {
  const isCommunications = await isModuleProvidedByCommunications(moduleName);

  if (isCommunications) {
    return { endpoint: '/config/communications', isCommunications: true };
  }

  // Return standalone endpoint
  const standaloneEndpoints: Record<CommunicationsModuleName, string> = {
    email: '/config/email',
    sms: '/config/sms',
    pushNotifications: '/config/pushNotifications',
  };

  return { endpoint: standaloneEndpoints[moduleName], isCommunications: false };
}

/**
 * Builds the patch payload for communications module.
 * Wraps the module-specific config in the appropriate nested structure.
 */
export function buildCommunicationsPatchPayload<T>(
  moduleName: CommunicationsModuleName,
  data: T
): { config: Partial<CommunicationsConfig> } {
  return {
    config: {
      [moduleName]: data,
    },
  };
}
