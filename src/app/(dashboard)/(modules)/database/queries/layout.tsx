'use client';

import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { QueryList } from '@/components/database/queries/query-list/query-list';
import {
  QueryWorkspaceProvider,
  type PendingNavigation,
} from '@/components/database/queries/query-workspace-context';
import {
  deleteCustomEndpoint,
  getCustomEndpoints,
  getSchemas,
} from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type LayoutProps = {
  children: React.ReactNode;
};

const PAGE_SIZE = 10;

function selectedIdFromPath(pathname: string) {
  const match = pathname.match(/\/database\/queries\/([^/]+)/);
  const id = match?.[1];
  if (!id || id === 'new') return undefined;
  return id;
}

export default function QueryLayout({ children }: Readonly<LayoutProps>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedModel, setSelectedModel] = React.useState<string>();
  const [queries, setQueries] = React.useState<CustomEndpoint[]>([]);
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [queriesError, setQueriesError] = React.useState<string | null>(null);
  const [isDirty, setDirty] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] =
    React.useState<PendingNavigation | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [listSheetOpen, setListSheetOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const [scrollRoot, setScrollRoot] = React.useState<HTMLDivElement | null>(
    null
  );
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const requestIdRef = React.useRef(0);
  const selectedQueryId = selectedIdFromPath(pathname);

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
      if (shouldClean) {
        setQueriesError(null);
      }

      try {
        const search = _term?.trim() ? _term.trim() : undefined;
        const { customEndpoints: newQueries, count } = await getCustomEndpoints(
          {
            skip: (_page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: 'createdAt',
            search,
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
        setQueriesError(null);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Could not load custom queries.';
        setQueriesError(message);
        if (shouldClean) {
          setQueries([]);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const fetchModels = React.useCallback(async () => {
    try {
      const { schemas } = await getSchemas({});
      setModels(schemas);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Could not load models',
        description: 'Model filtering may be unavailable until you retry.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  React.useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    void fetchQueries(1, debouncedSearch, selectedModel, true);
  }, [debouncedSearch, selectedModel, fetchQueries]);

  React.useEffect(() => {
    if (
      inView &&
      hasMore &&
      !isLoading &&
      queries.length > 0 &&
      !queriesError
    ) {
      void fetchQueries(page + 1, debouncedSearch, selectedModel, false);
    }
  }, [
    inView,
    hasMore,
    isLoading,
    fetchQueries,
    page,
    debouncedSearch,
    selectedModel,
    queries.length,
    queriesError,
  ]);

  React.useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const refreshQueries = React.useCallback(async () => {
    await fetchQueries(1, debouncedSearch, selectedModel, true);
  }, [debouncedSearch, fetchQueries, selectedModel]);

  const requestNavigation = React.useCallback(
    (navigate: PendingNavigation) => {
      if (isDirty) {
        setPendingNavigation(() => navigate);
        return;
      }
      navigate();
    },
    [isDirty]
  );

  const handleCreateQuery = () => {
    requestNavigation(() => {
      setListSheetOpen(false);
      router.push('/database/queries/new');
    });
  };

  const handleSelectQuery = (id: string) => {
    requestNavigation(() => {
      setListSheetOpen(false);
      router.push(`/database/queries/${id}`);
    });
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value === 'all' ? undefined : value);
  };

  const requestDelete = React.useCallback((id: string, name: string) => {
    setPendingDelete({ id, name });
  }, []);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    try {
      await deleteCustomEndpoint(target.id);
      setQueries(prev => prev.filter(q => q._id !== target.id));
      setPendingDelete(null);
      setDirty(false);
      toast({
        title: 'Query deleted',
        description: `${target.name} was removed.`,
      });
      if (selectedQueryId === target.id) {
        router.push('/database/queries/new');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Could not delete query.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelPendingNavigation = () => {
    setPendingNavigation(null);
  };

  const handleDiscardPendingNavigation = () => {
    const navigate = pendingNavigation;
    setPendingNavigation(null);
    setDirty(false);
    navigate?.();
  };

  const closeListSheet = React.useCallback(() => {
    setListSheetOpen(false);
  }, []);

  const workspaceValue = React.useMemo(
    () => ({
      selectedQueryId,
      isDirty,
      setDirty,
      requestNavigation,
      refreshQueries,
      requestDelete,
      closeListSheet,
    }),
    [
      closeListSheet,
      isDirty,
      refreshQueries,
      requestDelete,
      requestNavigation,
      selectedQueryId,
    ]
  );

  const listProps = {
    queries,
    models,
    selectedQuery: selectedQueryId,
    isLoading,
    searchTerm,
    selectedModel,
    queriesError,
    onSearchChange: setSearchTerm,
    onModelChange: handleModelChange,
    onQuerySelect: handleSelectQuery,
    onCreateQuery: handleCreateQuery,
    onDeleteQuery: requestDelete,
    onRetry: () => fetchQueries(1, debouncedSearch, selectedModel, true),
    loadMoreRef: ref,
    scrollRootRef: setScrollRoot,
  };

  return (
    <QueryWorkspaceProvider value={workspaceValue}>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 px-4 pb-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setListSheetOpen(true)}
          >
            <List className="mr-2 h-4 w-4" />
            Queries
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 gap-x-4 overflow-hidden px-4 pb-4">
          {isDesktop ? (
            <div className="flex h-full min-h-0">
              <QueryList {...listProps} />
            </div>
          ) : (
            <Sheet open={listSheetOpen} onOpenChange={setListSheetOpen}>
              <SheetContent
                side="left"
                className="flex w-80 flex-col p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b px-4 py-3 pr-12 text-left">
                  <SheetTitle className="text-base">Queries</SheetTitle>
                  <SheetDescription className="sr-only">
                    Search, filter, and open custom endpoints.
                  </SheetDescription>
                </SheetHeader>
                <QueryList {...listProps} />
              </SheetContent>
            </Sheet>
          )}

          <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-background shadow-xs">
            {children}
          </div>
        </div>
      </div>

      <AlertDialog
        open={pendingNavigation !== null}
        onOpenChange={open => {
          if (!open) handleCancelPendingNavigation();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this query. Leaving this view will
              discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPendingNavigation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardPendingNavigation}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom query?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{' '}
              <span className="font-medium text-foreground">
                {pendingDelete?.name}
              </span>{' '}
              from the platform. Existing data is not deleted, but clients that
              call this endpoint will fail. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={event => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryWorkspaceProvider>
  );
}
