'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavGroup } from './navGroup';

import Image from 'next/image';
import { NavUser } from './navUser';
import { navList } from './navList.config';
import { NavEnv } from '@/components/navigation/navEnv';
import { useModuleAvailability } from '@/contexts/ModuleAvailabilityContext';
import { filterNavigationByModules } from '@/lib/utils/module-utils';
import { Skeleton } from '@/components/ui/skeleton';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { modules, isLoading } = useModuleAvailability();

  // Filter navigation items based on available modules
  const filteredNavMain = React.useMemo(() => {
    if (isLoading) return navList.navMain;
    return filterNavigationByModules(navList.navMain, modules);
  }, [modules, isLoading]);

  const filteredNavSecondary = React.useMemo(() => {
    if (isLoading) return navList.navSecondary;
    return filterNavigationByModules(navList.navSecondary, modules);
  }, [modules, isLoading]);

  return (
    <Sidebar variant="inset" {...props} className="border-r border-r-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="sticky top-0 z-10 flex items-center h-11 bg-background">
              <Image
                className="w-auto h-8"
                width={178}
                height={32}
                src="/conduitLogo.svg"
                alt="Conduit Logo"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="main-scrollbar ">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <>
            <NavGroup items={filteredNavMain} label="Modules" />
            <NavGroup
              items={filteredNavSecondary}
              className="mt-3"
              label="Tools"
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavEnv />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
