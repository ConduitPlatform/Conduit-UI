'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions<T> {
  initialData?: T[];
  fetchItems: (page: number) => Promise<T[]>;
  hasMoreItems?: (items: T[], newItems: T[]) => boolean;
  pageSize?: number;
}

export function useInfiniteScroll<T>({
  initialData = [],
  fetchItems,
  hasMoreItems = (_, newItems) => newItems.length > 0,
  pageSize = 10,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchItems(page);
      setItems(prevItems => [...prevItems, ...newItems]);
      setHasMore(hasMoreItems(items, newItems));
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('An error occurred while fetching data')
      );
    } finally {
      setLoading(false);
    }
  }, [fetchItems, hasMore, hasMoreItems, items, loading, page]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    setItems,
    ref,
  };
}
