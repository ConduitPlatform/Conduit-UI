import { Module } from '@/lib/models/Module';

// Modules that the Communications module provides (for backward compatibility)
export const COMMUNICATIONS_PROVIDED_MODULES = [
  'email',
  'pushNotifications',
  'sms',
];

const COMMUNICATIONS_LOKI_LABELS = [
  'communications',
  'email',
  'sms',
  'pushNotifications',
] as const;

export function resolvePrometheusModuleName(moduleName: string): string {
  if (COMMUNICATIONS_PROVIDED_MODULES.includes(moduleName)) {
    return 'communications';
  }
  return moduleName;
}

export function getLokiModuleFilterForPath(pathname: string): string[] {
  const apiName =
    getApiModuleNameFromPath(pathname) ??
    pathname.split('/').filter(Boolean)[0] ??
    'core';

  if (
    apiName === 'communications' ||
    COMMUNICATIONS_PROVIDED_MODULES.includes(apiName)
  ) {
    return [...COMMUNICATIONS_LOKI_LABELS];
  }

  return apiName === 'core' ? ['core'] : [apiName];
}

export type SharedRuntimeInfo = {
  moduleName: string;
  description: string;
  systemMetricsSubtitle: string;
};

export const COMMUNICATIONS_SHARED_RUNTIME: SharedRuntimeInfo = {
  moduleName: 'Communications',
  description: 'Email, SMS, and push notifications share this service.',
  systemMetricsSubtitle: 'Process metrics for the Communications runtime',
};

// Map module names to their display names
export const MODULE_DISPLAY_NAMES: Record<string, string> = {
  authentication: 'Authentication',
  authorization: 'Authorization',
  database: 'Database',
  storage: 'Storage',
  chat: 'Chat',
  email: 'Email',
  sms: 'SMS',
  router: 'Router',
  functions: 'Functions',
  'push-notifications': 'Push',
  payments: 'Payments',
  settings: 'Settings',
  communications: 'Communications',
};

// Map module URLs to their module names (API module names)
export const MODULE_URL_TO_NAME: Record<string, string> = {
  '/authentication': 'authentication',
  '/authorization': 'authorization',
  '/database': 'database',
  '/storage': 'storage',
  '/chat': 'chat',
  '/email': 'email',
  '/sms': 'sms',
  '/router': 'router',
  '/functions': 'functions',
  '/push-notifications': 'pushNotifications', // URL path maps to API module name
  '/communications': 'communications',
  '/payments': 'payments',
  '/settings': 'settings',
};

// Map API module names to URL paths
export const MODULE_NAME_TO_URL: Record<string, string> = {
  authentication: 'authentication',
  authorization: 'authorization',
  database: 'database',
  storage: 'storage',
  chat: 'chat',
  email: 'email',
  sms: 'sms',
  router: 'router',
  functions: 'functions',
  pushNotifications: 'push-notifications', // API module name maps to URL path
  communications: 'communications',
  payments: 'payments',
  settings: 'settings',
};

// Core routes that should always be available (not subject to module filtering)
const CORE_ROUTES = ['/', '/settings', '/logs-viewer'];

// Get module name from URL path
export function getModuleNameFromPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const firstSegment = segments[0];
  return MODULE_URL_TO_NAME[`/${firstSegment}`] || null;
}

// Get API module name from URL path (for use in dashboard pages)
export function getApiModuleNameFromPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const firstSegment = segments[0];
  return MODULE_URL_TO_NAME[`/${firstSegment}`] || null;
}

// Get URL path from module name
export function getModuleUrlFromName(moduleName: string): string | null {
  return MODULE_NAME_TO_URL[moduleName] || null;
}

// Get display name for a module
export function getModuleDisplayName(moduleName: string): string {
  return MODULE_DISPLAY_NAMES[moduleName] || moduleName;
}

// Check if a module is available
export function isModuleAvailable(
  modules: Module[],
  moduleName: string
): boolean {
  // Direct check for the module
  if (modules.some(module => module.moduleName === moduleName)) {
    return true;
  }

  // If looking for a legacy module, check if communications provides it
  if (COMMUNICATIONS_PROVIDED_MODULES.includes(moduleName)) {
    return modules.some(module => module.moduleName === 'communications');
  }

  return false;
}

export function isModuleServing(
  modules: Module[],
  moduleName: string
): boolean {
  // Direct check for the module
  const directModule = modules.find(module => module.moduleName === moduleName);
  if (directModule) {
    return directModule.serving;
  }

  // Fallback to communications check for legacy modules
  if (COMMUNICATIONS_PROVIDED_MODULES.includes(moduleName)) {
    const commsModule = modules.find(
      module => module.moduleName === 'communications'
    );
    return commsModule?.serving ?? false;
  }

  return false;
}

// Filter navigation items based on available modules
export function filterNavigationByModules(
  navigationItems: any[],
  modules: Module[]
): any[] {
  return navigationItems.filter(item => {
    // Always include core routes and other non-module items
    if (CORE_ROUTES.includes(item.url) || !MODULE_URL_TO_NAME[item.url]) {
      return true;
    }

    const moduleName = MODULE_URL_TO_NAME[item.url];
    return isModuleAvailable(modules, moduleName);
  });
}
