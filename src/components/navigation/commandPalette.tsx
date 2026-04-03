'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { navList } from './navList.config';
import { useModuleAvailability } from '@/contexts/ModuleAvailabilityContext';
import { filterNavigationByModules } from '@/lib/utils/module-utils';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { modules, isLoading } = useModuleAvailability();

  const filteredNavMain = React.useMemo(() => {
    if (isLoading) return navList.navMain;
    return filterNavigationByModules(navList.navMain, modules);
  }, [modules, isLoading]);

  const filteredNavSecondary = React.useMemo(() => {
    if (isLoading) return navList.navSecondary;
    return filterNavigationByModules(navList.navSecondary, modules);
  }, [modules, isLoading]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const flattenNavItems = (
    items: typeof navList.navMain
  ): {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[] => {
    const result: {
      title: string;
      url: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[] = [];
    for (const item of items) {
      result.push({ title: item.title, url: item.url, icon: item.icon });
      if (item.items?.length) {
        for (const sub of item.items) {
          result.push({ title: `${item.title} > ${sub.title}`, url: sub.url });
        }
      }
    }
    return result;
  };

  const mainItems = flattenNavItems(filteredNavMain);
  const secondaryItems = flattenNavItems(filteredNavSecondary);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules and pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Modules">
          {mainItems.map(({ title, url, icon: Icon }) => (
            <CommandItem
              key={url + title}
              onSelect={() => runCommand(() => router.push(url))}
            >
              {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
              {title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tools">
          {secondaryItems.map(({ title, url, icon: Icon }) => (
            <CommandItem
              key={url + title}
              onSelect={() => runCommand(() => router.push(url))}
            >
              {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
              {title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
