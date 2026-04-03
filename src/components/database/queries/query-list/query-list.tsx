'use client';

import { Plus, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  hasMore: boolean;
  searchTerm?: string;
  selectedModel?: string;
  onSearchChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onQuerySelect: (id: string) => void;
  onCreateQuery: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function QueryList({
  queries: initialQueries,
  models: initialModels,
  selectedQuery,
  isLoading,
  searchTerm,
  selectedModel,
  onSearchChange,
  onModelChange,
  onQuerySelect,
  onCreateQuery,
  loadMoreRef,
}: Readonly<QueryListProps>) {
  const queries = React.useMemo(() => initialQueries, [initialQueries]);
  const models = React.useMemo(() => initialModels, [initialModels]);
  const [exportImportDialog, setExportImportDialog] = React.useState(false);
  const { toast } = useToast();

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
        // Note: The parent component should handle refreshing the queries list
        // This would typically be done by calling a refresh function passed as a prop
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
    <div className="w-2/12 border rounded-lg shadow-xs flex flex-col h-full overflow-hidden">
      <QueryFilters
        searchTerm={searchTerm ?? ''}
        onSearchChange={onSearchChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        models={models}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <QueryListSkeleton key={`skeleton-${i}`} />
              ))}
            {queries.map(query => (
              <QueryListItem
                key={query._id}
                query={query}
                isSelected={selectedQuery === query._id}
                onClick={() => onQuerySelect(query._id)}
              />
            ))}

            <div ref={loadMoreRef} className="h-4" />
          </div>
        </ScrollArea>
        <div className="p-4 border-t mt-auto space-y-2">
          <Button className="w-full" onClick={onCreateQuery}>
            <Plus className="w-4 h-4 mr-2" />
            New Query
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setExportImportDialog(true)}
          >
            <Download className="w-4 h-4 mr-1" />
            Export/Import
          </Button>
        </div>
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
