'use client';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { QueryList } from '@/components/database/queries/query-list/query-list';
import { useRouter } from 'next/navigation';
import { getCustomEndpoints, getSchemas } from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import { isEmpty } from 'lodash';

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
      debugger;

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
      console.log('Loading more queries...');
      fetchQueries(page, searchTerm, selectedModel, false);
    }
  }, [inView, hasMore, isLoading, fetchQueries, page]);

  // Reset pagination and queries when searchTerm or selectedModel changes
  React.useEffect(() => {
    if (!searchTerm && !selectedModel) {
      return;
    }
    console.log('Reset: Loading more queries...');
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

  return (
    <div className="h-full flex flex-col w-full overflow-auto">
      <div className="w-full absolute h-5/6 left-0 top-13 flex gap-x-4">
        {/* Left sidebar with query list */}
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
          /*@ts-ignore*/
          loadMoreRef={ref}
        />

        {/* Right side - Query editor */}
        <div className="w-full border rounded-lg shadow-sm bg-background h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
