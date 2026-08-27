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

const PAGE_SIZE = 10;

export default function QueryLayout({ children }: Readonly<LayoutProps>) {
  const [searchTerm, setSearchTerm] = React.useState<string>();
  const [selectedModel, setSelectedModel] = React.useState<string>();
  const [selectedQuery, setSelectedQuery] = React.useState<string>();
  const [queries, setQueries] = React.useState<CustomEndpoint[]>([]);
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [scrollRoot, setScrollRoot] = React.useState<HTMLDivElement | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();
  const requestIdRef = React.useRef(0);
  const { ref, inView } = useInView({
    threshold: 0,
    root: scrollRoot,
    rootMargin: '80px',
  });

  const fetchQueries = React.useCallback(
    async (
      _page: number,
      _term?: string,
      _model?: string,
      shouldClean?: boolean
    ) => {
      const requestId = shouldClean
        ? ++requestIdRef.current
        : requestIdRef.current;
      setIsLoading(true);

      try {
        const { customEndpoints: newQueries, count } = await getCustomEndpoints(
          {
            skip: (_page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: 'createdAt',
            search: !_term || isEmpty(_term) ? undefined : _term,
            schemaName: _model ? [_model] : undefined,
          }
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        const incoming = newQueries ?? [];
        setQueries(prev => {
          if (shouldClean) {
            return incoming;
          }
          const existingIds = new Set(prev.map(query => query._id));
          const filteredQueries = incoming.filter(
            query => !existingIds.has(query._id)
          );
          return [...prev, ...filteredQueries];
        });
        setHasMore(
          incoming.length > 0 &&
            count > (_page - 1) * PAGE_SIZE + incoming.length
        );
        setPage(_page);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const fetchModels = React.useCallback(async () => {
    const { schemas } = await getSchemas({});
    setModels(schemas);
  }, []);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  React.useEffect(() => {
    setQueries([]);
    setPage(1);
    setHasMore(true);
    fetchQueries(1, searchTerm, selectedModel, true);
  }, [searchTerm, selectedModel, fetchQueries]);

  React.useEffect(() => {
    if (inView && hasMore && !isLoading && queries.length > 0) {
      fetchQueries(page + 1, searchTerm, selectedModel, false);
    }
  }, [
    inView,
    hasMore,
    isLoading,
    fetchQueries,
    page,
    searchTerm,
    selectedModel,
    queries.length,
  ]);

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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 gap-x-4 overflow-hidden px-4 pb-4">
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
          scrollRootRef={setScrollRoot}
        />

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-background shadow-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
