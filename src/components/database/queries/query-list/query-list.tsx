'use client';

import { Plus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueryListItem } from './query-list-item';
import { QueryListSkeleton } from './query-list-skeleton';
import { QueryFilters } from './query-filters';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import React from 'react';
import ExportImportDialog from '@/components/ui/export-import-dialog';
import {
  exportCustomEndpoints,
  importCustomEndpoints,
} from '@/lib/api/database';
import { useToast } from '@/lib/hooks/use-toast';

interface QueryListProps {
  queries: CustomEndpoint[];
  models: DeclaredSchema[];
  selectedQuery?: string;
  isLoading: boolean;
  searchTerm?: string;
  selectedModel?: string;
  onSearchChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onQuerySelect: (id: string) => void;
  onCreateQuery: () => void;
  onDeleteQuery?: (id: string) => void;
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
  onSearchChange,
  onModelChange,
  onQuerySelect,
  onCreateQuery,
  onDeleteQuery,
  loadMoreRef,
  scrollRootRef,
}: Readonly<QueryListProps>) {
  const [exportImportDialog, setExportImportDialog] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const isInitialLoading = isLoading && queries.length === 0;
  const isLoadingMore = isLoading && queries.length > 0;

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
          title: 'Export Successful',
          description: 'Custom endpoints have been exported successfully.',
        });
      })
      .catch(error => {
        console.error(error);
        toast({
          title: 'Export Failed',
          description: 'Failed to export custom endpoints.',
          variant: 'destructive',
        });
      });
  };

  const handleImport = (imp: any) => {
    importCustomEndpoints(imp)
      .then(() => {
        toast({
          title: 'Import Successful',
          description: 'Custom endpoints have been imported successfully.',
        });
      })
      .catch(error => {
        console.error(error);
        toast({
          title: 'Import Failed',
          description: 'Failed to import custom endpoints.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden rounded-lg border shadow-xs">
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
          {!isInitialLoading && queries.length === 0 && (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground text-pretty">
              {searchTerm || selectedModel
                ? 'No queries match the current filters.'
                : 'No custom queries yet.'}
            </p>
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

      <div className="mt-auto shrink-0 space-y-2 border-t p-4">
        <Button className="w-full" onClick={onCreateQuery}>
          <Plus className="mr-2 h-4 w-4" />
          New Query
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setExportImportDialog(true)}
        >
          <Download className="mr-1 h-4 w-4" />
          Export/Import
        </Button>
      </div>

      <ExportImportDialog
        title="Custom Endpoints"
        open={exportImportDialog}
        onOpenChange={setExportImportDialog}
        onExport={handleExport}
        onImport={handleImport}
        importInfo="WARNING: Custom Endpoints with the same name will be overridden"
      />
    </div>
  );
}
