'use client';

import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { QueryListItem } from './query-list-item';
import { QueryListSkeleton } from './query-list-skeleton';
import { QueryFilters } from './query-filters';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import React from 'react';

interface QueryListProps {
  queries: CustomEndpoint[];
  models: DeclaredSchema[];
  selectedQuery: string | null;
  isLoading: boolean;
  hasMore: boolean;
  searchTerm: string;
  selectedModel: string | null;
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
  return (
    <div className="w-2/12 border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      <QueryFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        models={models}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {queries.map(query => (
              <QueryListItem
                key={query._id}
                query={query}
                isSelected={selectedQuery === query._id}
                onClick={() => onQuerySelect(query._id)}
              />
            ))}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <QueryListSkeleton key={`skeleton-${i}`} />
              ))}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        </ScrollArea>
        <div className="p-4 border-t mt-auto">
          <Button className="w-full" onClick={onCreateQuery}>
            <Plus className="w-4 h-4 mr-2" />
            New Query
          </Button>
        </div>
      </div>
    </div>
  );
}
