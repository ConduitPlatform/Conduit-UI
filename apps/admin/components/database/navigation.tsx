'use client';

import * as React from 'react';
import { MigratedSchemas, PendingSchemas, Views } from '@/lib/models/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, PlusIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { getSchemas } from '@/lib/api/database';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type DatabaseNavigationProps = {
  data: {
    views: Views[];
    pending: PendingSchemas[];
    migrated: MigratedSchemas[];
  };
  modules: string[];
};

const DatabaseSidebar = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="row-span-11 overflow-auto col-span-1 px-2 py-2.5 text-sidebar-foreground flex flex-col bg-sidebar border space-y-4">
      {children}
    </div>
  );
};

export const DatabaseNavigation = ({
  data: { views, pending, migrated },
  modules = [],
}: DatabaseNavigationProps) => {
  const [models, setModels] = useState<Awaited<ReturnType<typeof getSchemas>>>({
    schemas: [],
    count: 0,
  });
  const [value, setValue] = useState<string | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    getSchemas({
      limit: 1000,
      enabled: true,
      search: value,
      owner: searchParams.get('module')
        ? [searchParams.get('module') ?? '']
        : undefined,
    }).then(res => {
      setModels(res);
    });
  }, [searchParams.get('module'), value]);

  return (
    <DatabaseSidebar>
      <div className="w-full space-y-4">
        <Input
          placeholder="Search models..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" variant="outline">
              {searchParams.get('module') ?? 'Select Module'}
              <ChevronDown className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            {modules.map(module => (
              <DropdownMenuItem
                onSelect={() => {
                  router.push(`${pathname}?module=${module}`);
                }}
              >
                <span>{module}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 space-y-4 overflow-auto ">
        <Collapsible defaultOpen className="group/collapsible">
          <CollapsibleTrigger className="items-center flex w-full">
            <div className="flex space-x-3 text-sm font-medium text-sidebar-foreground/70">
              <span>All Models</span>
              <Badge variant="secondary">{models.count}</Badge>
            </div>
            <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="gap-y-1">
            {models.schemas.map(model => (
              <div key={model._id}>
                <button
                  className={cn(
                    `${
                      searchParams.get('model') === model.name
                        ? 'bg-sidebar-foreground/10'
                        : ''
                    }`,
                    'text-start w-full p-2 text-sm font-medium rounded-lg'
                  )}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('model', model.name);
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  <span>{model.name}</span>
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="group/collapsible">
          <CollapsibleTrigger className="items-center justify-between flex w-full ">
            <div className="flex space-x-3 text-sm font-medium text-sidebar-foreground/70">
              <span>All Views</span>
              <Badge variant="secondary">{views.length}</Badge>
            </div>
            <ChevronUp className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {views.map(model => (
              <div key={model._id}>
                <button
                  className={cn(
                    `${
                      searchParams.get('model') === model.name
                        ? 'bg-sidebar-foreground/10'
                        : ''
                    }`,
                    'text-start w-full p-2 text-sm font-medium rounded-lg'
                  )}
                >
                  <span>{model.name}</span>
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="group/collapsible">
          <CollapsibleTrigger className="items-center justify-between flex w-full ">
            <div className="flex space-x-3 text-sm font-medium text-sidebar-foreground/70">
              <span>Migrated Models</span>
              <Badge variant="secondary">{migrated.length}</Badge>
            </div>
            <ChevronUp className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {migrated.map(model => (
              <div key={model._id}>
                <button
                  className={cn(
                    `${
                      searchParams.get('model') === model.name
                        ? 'bg-sidebar-foreground/10'
                        : ''
                    }`,
                    'text-start w-full p-2 text-sm font-medium rounded-lg'
                  )}
                >
                  <span>{model.name}</span>
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="group/collapsible">
          <CollapsibleTrigger className="items-center flex w-full ">
            <div className="flex space-x-3 text-sm font-medium text-sidebar-foreground/70">
              <span>Pending Models</span>
              <Badge variant="secondary" className="items-center">
                {pending.length}
              </Badge>
            </div>
            <ChevronUp className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {pending.map(model => (
              <div key={model._id}>
                <button
                  className={cn(
                    `${
                      searchParams.get('model') === model.name
                        ? 'bg-sidebar-foreground/10'
                        : ''
                    }`,
                    'text-start w-full p-2 text-sm font-medium rounded-lg'
                  )}
                >
                  <span>{model.name}</span>
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="bg-background py-1">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => console.log('trigger drawer')}
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">New Model</span>
        </Button>
      </div>
    </DatabaseSidebar>
  );
};
