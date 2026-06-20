import {
  CommunicationsConfig,
  CommunicationsModuleName,
} from '@/lib/models/communications';

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
