'use client';

import { Plus, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueryListItem } from './query-list-item';
import { QueryListSkeleton } from './query-list-skeleton';
import { QueryFilters } from './query-filters';
import { QueryEmptyState } from '@/components/database/queries/empty-state';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import React from 'react';
import ExportImportDialog from '@/components/ui/export-import-dialog';
import {
  exportCustomEndpoints,
  importCustomEndpoints,
} from '@/lib/api/database';
import { useToast } from '@/lib/hooks/use-toast';
import { useQueryWorkspaceOptional } from '@/components/database/queries/query-workspace-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface QueryListProps {
  queries: CustomEndpoint[];
  models: DeclaredSchema[];
  selectedQuery?: string;
  isLoading: boolean;
  searchTerm?: string;
  selectedModel?: string;
  queriesError?: string | null;
  onSearchChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onQuerySelect: (id: string) => void;
  onCreateQuery: () => void;
  onDeleteQuery?: (id: string, name: string) => void;
  onRetry?: () => void;
  loadMoreRef: React.Ref<HTMLDivElement>;
  scrollRootRef: (node: HTMLDivElement | null) => void;
}

export function QueryList({
  queries,
  models,
  selectedQuery,
  isLoading,
  searchTerm,
  selectedModel,
  queriesError,
  onSearchChange,
  onModelChange,
  onQuerySelect,
  onCreateQuery,
  onDeleteQuery,
  onRetry,
  loadMoreRef,
  scrollRootRef,
}: Readonly<QueryListProps>) {
  const [exportImportDialog, setExportImportDialog] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const workspace = useQueryWorkspaceOptional();

  const isInitialLoading = isLoading && queries.length === 0 && !queriesError;
  const isLoadingMore = isLoading && queries.length > 0;
  const hasFilters = Boolean(searchTerm || selectedModel);

  const setListNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      scrollRootRef(node);
    },
    [scrollRootRef]
  );

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchTerm, selectedModel]);

  const handleExport = () => {
    exportCustomEndpoints()
      .then(res => {
        const json = JSON.stringify(res, null, 2);
        const href = URL.createObjectURL(
          new Blob([json], { type: 'application/json' })
        );
        const link = document.createElement('a');
        link.download = 'conduit-custom-endpoints.json';
        link.href = href;
        link.click();
        URL.revokeObjectURL(href);
        toast({
          title: 'Export successful',
          description: 'Custom endpoints have been exported.',
        });
      })
      .catch(error => {
        console.error(error);
        toast({
          title: 'Export failed',
          description: 'Failed to export custom endpoints.',
          variant: 'destructive',
        });
      });
  };

  const handleImport = async (imp: unknown) => {
    await importCustomEndpoints(imp);
    toast({
      title: 'Import successful',
      description: 'Custom endpoints have been imported.',
    });
    await workspace?.refreshQueries();
  };

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden md:w-72 md:rounded-lg md:border md:shadow-xs'
      )}
    >
      <QueryFilters
        searchTerm={searchTerm ?? ''}
        onSearchChange={onSearchChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        models={models}
      />

      <div
        ref={setListNode}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain main-scrollbar"
      >
        <div className="p-4">
          {queriesError && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load queries</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{queriesError}</p>
                {onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={onRetry}
                  >
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          {isInitialLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <QueryListSkeleton key={`skeleton-${i}`} />
            ))}
          {queries.map(query => (
            <QueryListItem
              key={query._id}
              query={query}
              isSelected={selectedQuery === query._id}
              onClick={() => onQuerySelect(query._id)}
              onDelete={onDeleteQuery}
            />
          ))}
          {!isInitialLoading && !queriesError && queries.length === 0 && (
            <QueryEmptyState
              className="py-8"
              title={
                hasFilters ? 'No matching queries' : 'No custom queries yet'
              }
              description={
                hasFilters
                  ? 'Try a different search or model filter.'
                  : 'Create an endpoint to expose a filtered query on the Client API.'
              }
              action={
                !hasFilters ? (
                  <Button type="button" size="sm" onClick={onCreateQuery}>
                    <Plus className="mr-2 h-4 w-4" />
                    New query
                  </Button>
                ) : undefined
              }
            />
          )}
          <div
            ref={loadMoreRef}
            className="flex h-8 items-center justify-center"
          >
            {isLoadingMore && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-2 border-t p-4">
        <Button className="w-full" onClick={onCreateQuery}>
          <Plus className="mr-2 h-4 w-4" />
          New query
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setExportImportDialog(true)}
        >
          <Download className="mr-1 h-4 w-4" />
          Export / Import
        </Button>
      </div>

      <ExportImportDialog
        title="Custom Endpoints"
        open={exportImportDialog}
        onOpenChange={setExportImportDialog}
        onExport={handleExport}
        onImport={handleImport}
        confirmImport
        importInfo="Custom endpoints with the same name will be overwritten."
      />
    </div>
  );
}
