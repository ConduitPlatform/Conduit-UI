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

  // Check if module is available and serving
  const available = isModuleAvailable(moduleName);
  const serving = isModuleServing(moduleName);
  const isSettingsRoute = pathname.startsWith(
    `/${moduleName.toLowerCase()}/settings`
  );
  // If module is not available or not serving, show module not found
  if (!available) {
    // Map the API module name to the URL path for display name lookup
    const urlPath = pathname.split('/')[1];
    const displayName = getModuleDisplayName(urlPath);
    return (
      <ModuleNotFound
        moduleName={displayName}
        isAvailable={available}
        isServing={serving}
      />
    );
  } else if (!serving && !isSettingsRoute) {
    // If module is not serving and not on settings route, show module not found
    const displayName = getModuleDisplayName(moduleName);
    return (
      <ModuleNotFound
        moduleName={displayName}
        isAvailable={available}
        isServing={serving}
      />
    );
  }

  // Module is available and serving, render children
  return <>{children}</>;
}
