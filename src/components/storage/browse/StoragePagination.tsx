'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { useStorageBrowse } from './StorageBrowseProvider';

export function StoragePagination() {
  const { filesCount, page, setPage, itemsPerPage } = useStorageBrowse();

  const pageCount = Math.ceil(filesCount / itemsPerPage);

  const visiblePages = useMemo<
    (number | 'ellipsis-start' | 'ellipsis-end')[]
  >(() => {
    if (pageCount <= 1) return [];

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    pages.push(1);

    const siblingCount = 1;
    const leftSibling = Math.max(page - siblingCount, 2);
    const rightSibling = Math.min(page + siblingCount, pageCount - 1);

    if (leftSibling > 2) {
      pages.push('ellipsis-start');
    } else if (pageCount > 1) {
      pages.push(2);
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i > 1 && i < pageCount && !pages.includes(i)) {
        pages.push(i);
      }
    }

    if (rightSibling < pageCount - 1) {
      pages.push('ellipsis-end');
    }

    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  }, [page, pageCount]);

  if (pageCount <= 1) return null;

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, filesCount);

  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-muted-foreground">
        Showing {startItem}–{endItem} of {filesCount} files
      </span>
      <Pagination className="justify-end w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
          </PaginationItem>

          {visiblePages.map((p, index) =>
            p === 'ellipsis-start' || p === 'ellipsis-end' ? (
              <PaginationItem key={`${p}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem
                key={`page-${p}`}
                className="hover:cursor-pointer"
              >
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page === pageCount}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
