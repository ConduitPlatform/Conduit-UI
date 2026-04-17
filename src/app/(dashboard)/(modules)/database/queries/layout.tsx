'use client';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { QueryList } from '@/components/database/queries/query-list/query-list';
import { useRouter } from 'next/navigation';
import {
  deleteCustomEndpoint,
  getCustomEndpoints,
  getSchemas,
} from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import { isEmpty } from 'lodash';
import { useToast } from '@/lib/hooks/use-toast';

type LayoutProps = {
  children: React.ReactNode;
};

export default function QueryLayout({ children }: Readonly<LayoutProps>) {
  const [searchTerm, setSearchTerm] = React.useState<string>();
  const [selectedModel, setSelectedModel] = React.useState<string>();
  const [selectedQuery, setSelectedQuery] = React.useState<string>();
  const [queries, setQueries] = React.useState<CustomEndpoint[]>([]);
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const { toast } = useToast();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchQueries = React.useCallback(
    async (
      _page: number,
      _term?: string,
      _model?: string,
      shouldClean?: boolean
    ) => {
      setIsLoading(true);

      const { customEndpoints: newQueries, count } = await getCustomEndpoints({
        skip: (_page - 1) * 10,
        limit: 10,
        sort: 'createdAt',
        search: !_term || isEmpty(_term) ? undefined : _term,
        schemaName: _model ? [_model] : undefined,
      });

      setQueries(prev => {
        if (shouldClean) {
          return newQueries;
        }
        // check that newQueries are not already in the queries
        const existingQueries = prev.map(query => query._id);
        const filteredQueries =
          newQueries?.filter(query => !existingQueries.includes(query._id)) ??
          [];
        return [...prev, ...(filteredQueries ?? [])];
      });
      setHasMore(
        newQueries?.length > 0 && count > (_page - 1) * 10 + newQueries?.length
      );
      setPage(prev => prev + 1);
      setIsLoading(false);
    },
    []
  );

  // Mock function to fetch models
  const fetchModels = React.useCallback(async () => {
    const { schemas } = await getSchemas({});
    setModels(schemas);
  }, [setModels]);

  // Initial data fetch
  React.useEffect(() => {
    fetchModels();
  }, []);

  // Load more when scrolling to the bottom
  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchQueries(page, searchTerm, selectedModel, false);
    }
  }, [inView, hasMore, isLoading, fetchQueries, page]);

  // Reset pagination and queries when searchTerm or selectedModel changes
  React.useEffect(() => {
    if (!searchTerm && !selectedModel) {
      return;
    }
    setPage(1);
    fetchQueries(1, searchTerm, selectedModel, true);
  }, [searchTerm, selectedModel]);

  const handleCreateQuery = () => {
    router.push(`/database/queries/new`);
    setSelectedQuery(undefined);
  };

  const handleSelectQuery = (id: string) => {
    router.push(`/database/queries/${id}`);
    setSelectedQuery(id);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value === 'all' ? undefined : value);
  };

  const handleDeleteQuery = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Delete this custom query? This cannot be undone.')) {
        return;
      }
      try {
        await deleteCustomEndpoint(id);
        setQueries(prev => prev.filter(q => q._id !== id));
        if (selectedQuery === id) {
          setSelectedQuery(undefined);
          router.push('/database/queries/new');
        }
        toast({
          title: 'Query deleted',
          description: 'The custom query was removed.',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Delete failed',
          description:
            error instanceof Error ? error.message : 'Could not delete query.',
          variant: 'destructive',
        });
      }
    },
    [router, selectedQuery, toast]
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 gap-x-4 px-4 pb-4">
        <QueryList
          queries={queries}
          models={models}
          selectedQuery={selectedQuery}
          isLoading={isLoading}
          searchTerm={searchTerm}
          selectedModel={selectedModel}
          onSearchChange={setSearchTerm}
          onModelChange={handleModelChange}
          onQuerySelect={handleSelectQuery}
          onCreateQuery={handleCreateQuery}
          onDeleteQuery={handleDeleteQuery}
          loadMoreRef={ref}
        />

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-background shadow-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
