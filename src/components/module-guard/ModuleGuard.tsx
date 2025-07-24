'use client';

import { usePathname } from 'next/navigation';
import { useModuleAvailability } from '@/contexts/ModuleAvailabilityContext';
import {
  getModuleDisplayName,
  getModuleNameFromPath,
} from '@/lib/utils/module-utils';
import { ModuleNotFound } from '@/components/module-not-found/ModuleNotFound';
import { Skeleton } from '@/components/ui/skeleton';

interface ModuleGuardProps {
  children: React.ReactNode;
}

// Helper function to convert kebab-case URL to camelCase module name
function getApiModuleName(urlPath: string): string {
  const moduleMappings: Record<string, string> = {
    'push-notifications': 'pushNotifications',
    // Add other mappings as needed
  };

  return moduleMappings[urlPath] || urlPath;
}

export function ModuleGuard({ children }: ModuleGuardProps) {
  const pathname = usePathname();
  const { modules, isLoading, isModuleAvailable, isModuleServing } =
    useModuleAvailability();

  // Get module name from current path
  const moduleName = getModuleNameFromPath(pathname);

  // If not a module path, loading, or settings route, render children
  if (!moduleName || isLoading || pathname.startsWith('/settings')) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Get the URL path segment for display name lookup
  const urlPath = pathname.split('/')[1];

  // Convert to API module name for availability checks
  const apiModuleName = getApiModuleName(urlPath);

  // Check if module is available and serving
  const available = isModuleAvailable(apiModuleName);
  const serving = isModuleServing(apiModuleName);
  const isSettingsRoute = pathname.startsWith(`/${urlPath}/settings`);
  const isDashboardRoute = pathname === `/${urlPath}`;

  // If module is not available, show module not found
  if (!available) {
    const displayName = getModuleDisplayName(urlPath);
    return (
      <ModuleNotFound
        moduleName={displayName}
        isAvailable={available}
        isServing={serving}
      />
    );
  } else if (!serving && !isSettingsRoute && !isDashboardRoute) {
    // If module is not serving and not on settings or dashboard route, show module not found
    const displayName = getModuleDisplayName(urlPath);
    return (
      <ModuleNotFound
        moduleName={displayName}
        isAvailable={available}
        isServing={serving}
      />
    );
  }

  // Module is available and either serving or on dashboard/settings route, render children
  return <>{children}</>;
}
