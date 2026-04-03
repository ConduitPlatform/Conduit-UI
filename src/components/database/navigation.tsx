'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
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
import { getSchemas } from '@/lib/api/database';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ModelEditor } from '@/components/database/modelEditor/model-editor';
import { isEmpty } from 'lodash';
import ExportImportDialog from '@/components/ui/export-import-dialog';
import { exportSchemas, importSchemas } from '@/lib/api/database';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

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
    <div className="h-full min-w-60 px-2 py-2.5 text-sidebar-foreground flex flex-col bg-sidebar border space-y-4">
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
  const [exportImportDialog, setExportImportDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let modulePick = searchParams.get('module');
    let owner: string[] | undefined;
    if (!isEmpty(modulePick) && modulePick !== 'all') {
      owner = [modulePick as string];
    }
    getSchemas({
      limit: 1000,
      enabled: true,
      search: value,
      owner: owner,
    }).then(res => {
      setModels(res);
    });
  }, [searchParams.get('module'), value]);

  const handleExport = () => {
    exportSchemas()
      .then(res => {
        const json = JSON.stringify(res, null, 2);
        const href = URL.createObjectURL(
          new Blob([json], { type: 'application/json' })
        );
        const link = document.createElement('a');
        link.download = 'conduit-schemas.json';
        link.href = href;
        link.click();
        URL.revokeObjectURL(href);
        toast({
          title: 'Export Successful',
          description: 'Database schemas have been exported successfully.',
        });
      })
      .catch(error => {
        console.error(error);
        toast({
          title: 'Export Failed',
          description: 'Failed to export database schemas.',
          variant: 'destructive',
        });
      });
  };

  const handleImport = (imp: any) => {
    importSchemas(imp)
      .then(() => {
        toast({
          title: 'Import Successful',
          description: 'Database schemas have been imported successfully.',
        });
        // Refresh the models list
        getSchemas({
          limit: 1000,
          enabled: true,
          search: value,
          owner:
            searchParams.get('module') && searchParams.get('module') !== 'all'
              ? [searchParams.get('module') as string]
              : undefined,
        }).then(res => {
          setModels(res);
        });
      })
      .catch(error => {
        console.error(error);
        toast({
          title: 'Import Failed',
          description: 'Failed to import database schemas.',
          variant: 'destructive',
        });
      });
  };

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
          <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
            <DropdownMenuItem
              key={'all'}
              onSelect={() => {
                router.push(`${pathname}?module=all`);
              }}
            >
              <span>Any</span>
            </DropdownMenuItem>
            {modules.map(module => (
              <DropdownMenuItem
                key={module}
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
                    params.set('modelId', model._id);
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
                  type="button"
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
                    params.set('modelId', model._id);
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
              <span>Migrated Models</span>
              <Badge variant="secondary">{migrated.length}</Badge>
            </div>
            <ChevronUp className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {migrated.map(model => (
              <div key={model._id}>
                <button
                  type="button"
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
                    params.set('modelId', model._id);
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
                  type="button"
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
                    params.set('modelId', model._id);
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  <span>{model.name}</span>
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="bg-background py-1 space-y-4">
        <ModelEditor>
          <Button className="w-full" variant="outline">
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">New Model</span>
          </Button>
        </ModelEditor>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setExportImportDialog(true)}
          >
            <Download className="w-4 h-4 mr-1" />
            Export/Import
          </Button>
        </div>
      </div>

      <ExportImportDialog
        title="Database Schemas"
        open={exportImportDialog}
        onOpenChange={setExportImportDialog}
        onExport={handleExport}
        onImport={handleImport}
        importInfo="WARNING: Database Schemas with the same name will be overridden"
      />
    </DatabaseSidebar>
  );
};
