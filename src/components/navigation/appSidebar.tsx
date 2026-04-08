'use client';

import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { ConduitMark } from './ConduitMark';
import { SidebarNavItem } from './SidebarNavItem';
import { NavUser } from './navUser';
import { navGroups, navFooter, type NavGroup } from './navList.config';
import { useModuleAvailability } from '@/contexts/ModuleAvailabilityContext';
import {
  filterNavigationByModules,
  MODULE_URL_TO_NAME,
} from '@/lib/utils/module-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function useFilteredGroups(groups: NavGroup[]) {
  const { modules, isLoading, isModuleServing } = useModuleAvailability();

  return React.useMemo(() => {
    if (isLoading)
      return {
        filteredGroups: groups,
        servingMap: {} as Record<string, boolean>,
      };

    const servingMap: Record<string, boolean> = {};
    const filteredGroups = groups
      .map(group => ({
        ...group,
        items: filterNavigationByModules(group.items, modules).map(item => {
          const moduleName = MODULE_URL_TO_NAME[item.url];
          if (moduleName) {
            servingMap[item.url] = isModuleServing(moduleName);
          }
          return item;
        }),
      }))
      .filter(group => group.items.length > 0);

    return { filteredGroups, servingMap };
  }, [groups, modules, isLoading, isModuleServing]);
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 pt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="size-8 rounded-[6px]" />
      ))}
    </div>
  );
}

interface SidebarRailContentProps {
  className?: string;
}

function SidebarRailContent({ className }: SidebarRailContentProps) {
  const { isLoading } = useModuleAvailability();
  const { filteredGroups, servingMap } = useFilteredGroups(navGroups);

  return (
    <nav
      className={cn(
        'flex flex-col items-center h-full bg-sidebar border-r border-sidebar-border',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-12 w-full shrink-0">
        <ConduitMark size={22} className="text-primary" />
      </div>

      {/* Navigation groups */}
      <div className="sidebar-rail-nav flex flex-col items-center gap-0.5 flex-1 overflow-y-auto overflow-x-hidden py-1 main-scrollbar w-full">
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <React.Fragment key={group.id}>
              {groupIdx > 0 && <div className="sidebar-divider" />}
              {group.items.map(item => (
                <SidebarNavItem
                  key={item.url}
                  item={item}
                  serving={servingMap[item.url]}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-0.5 pb-3 shrink-0 w-full">
        <div className="sidebar-divider" />
        <SidebarNavItem item={navFooter} />
        <NavUser />
      </div>
    </nav>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isMobile) setMobileOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[52px] p-0 border-r-0 bg-sidebar [&>button]:hidden"
        >
          <TooltipProvider delayDuration={0}>
            <SidebarRailContent />
          </TooltipProvider>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarRailContent className="w-[52px] shrink-0 fixed inset-y-0 left-0 z-10" />
    </TooltipProvider>
  );
}
