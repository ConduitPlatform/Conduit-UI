import { Module } from '@/lib/models/Module';

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
  'push-notifications': 'Notifications',
  payments: 'Payments',
  settings: 'Settings',
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
  '/payments': 'payments',
  '/settings': 'settings',
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

// Get display name for a module
export function getModuleDisplayName(moduleName: string): string {
  return MODULE_DISPLAY_NAMES[moduleName] || moduleName;
}

// Check if a module is available and serving
export function isModuleAvailable(
  modules: Module[],
  moduleName: string
): boolean {
  return modules.some(module => module.moduleName === moduleName);
}

export function isModuleServing(
  modules: Module[],
  moduleName: string
): boolean {
  return modules.some(
    module => module.moduleName === moduleName && module.serving
  );
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
