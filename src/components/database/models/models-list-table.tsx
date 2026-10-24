'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DeclaredSchema } from '@/lib/models/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Database,
  Trash2,
  ExternalLink,
  FileJson,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ModelsListTableProps = {
  schemas: DeclaredSchema[];
  modules: string[];
  count: number;
  page: number;
  pageSize: number;
  initialSearch: string;
  initialOwners: string[];
  onCreateNew: () => void;
  onSelect: (modelId: string, listQuery?: string) => void;
  onOpenSchemaTransfer: () => void;
  onDelete?: (modelId: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

export function ModelsListTable({
  schemas,
  modules,
  count,
  page,
  pageSize,
  initialSearch,
  initialOwners,
  onCreateNew,
  onSelect,
  onOpenSchemaTransfer,
  onDelete,
}: ModelsListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = React.useState(initialSearch);

  // Keep the input in sync if the URL changes from outside (e.g. Back button).
  React.useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  const setParams = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce search input -> URL.
  React.useEffect(() => {
    if (searchInput === initialSearch) return;
    const handle = window.setTimeout(() => {
      setParams({ search: searchInput || null, page: null });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput, initialSearch, setParams]);

  const selectedOwners = React.useMemo(
    () => new Set(initialOwners),
    [initialOwners]
  );

  const toggleOwner = (owner: string) => {
    const next = new Set(selectedOwners);
    if (next.has(owner)) {
      next.delete(owner);
    } else {
      next.add(owner);
    }
    const ordered = modules.filter(m => next.has(m));
    setParams({
      owner: ordered.length > 0 ? ordered.join(',') : null,
      page: null,
    });
  };

  const clearOwners = () => {
    setParams({ owner: null, page: null });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setParams({ search: null, owner: null, page: null });
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const hasFilters = initialSearch.length > 0 || selectedOwners.size > 0;
  const showPagination = count > pageSize;

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), totalPages);
    if (clamped === page) return;
    setParams({ page: clamped === 1 ? null : String(clamped) });
  };

  const getFieldCount = (schema: DeclaredSchema) => {
    const fields = schema.compiledFields || schema.fields || {};
    return Object.keys(fields).length;
  };

  const pageNumbers = React.useMemo(
    () => buildPageList(page, totalPages),
    [page, totalPages]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Database Models</h1>
          </div>
          <Badge variant="secondary">
            {count} {count === 1 ? 'model' : 'models'}
            {hasFilters ? ' (filtered)' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onOpenSchemaTransfer}
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            Export / Import
          </Button>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Model
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Owner chips */}
      {modules.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b">
          <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">
            Owner
          </span>
          <OwnerChip
            label="All"
            isActive={selectedOwners.size === 0}
            onClick={clearOwners}
          />
          {modules.map(owner => (
            <OwnerChip
              key={owner}
              label={owner}
              isActive={selectedOwners.has(owner)}
              onClick={() => toggleOwner(owner)}
            />
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {schemas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileJson className="w-8 h-8 text-muted-foreground" />
            </div>
            {hasFilters ? (
              <>
                <p className="text-lg font-medium">No models found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No models match the current filters
                </p>
                <Button
                  variant="link"
                  onClick={clearAllFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No models created yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first model to get started
                </p>
                <Button onClick={onCreateNew} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Model
                </Button>
              </>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">NAME</TableHead>
                <TableHead>OWNER</TableHead>
                <TableHead className="text-right">FIELDS</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemas.map(schema => (
                <TableRow
                  key={schema._id}
                  className="cursor-pointer"
                  onClick={() => {
                    const listQuery = searchParams.toString();
                    onSelect(schema._id, listQuery || undefined);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <FileJson className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{schema.name}</p>
                        {schema.extensions && schema.extensions.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {schema.extensions.length} extension(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        schema.ownerModule === 'database'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="font-normal"
                    >
                      {schema.ownerModule || 'database'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">
                      {getFieldCount(schema)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={e => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            const listQuery = searchParams.toString();
                            onSelect(schema._id, listQuery || undefined);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        {onDelete && schema.ownerModule === 'database' && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(schema._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="border-t px-6 py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page <= 1}
                  className={cn(page <= 1 && 'pointer-events-none opacity-50')}
                  onClick={e => {
                    e.preventDefault();
                    goToPage(page - 1);
                  }}
                />
              </PaginationItem>
              {pageNumbers.map((entry, idx) =>
                entry === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={entry}>
                    <PaginationLink
                      href="#"
                      isActive={entry === page}
                      onClick={e => {
                        e.preventDefault();
                        goToPage(entry);
                      }}
                    >
                      {entry}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page >= totalPages}
                  className={cn(
                    page >= totalPages && 'pointer-events-none opacity-50'
                  )}
                  onClick={e => {
                    e.preventDefault();
                    goToPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

type OwnerChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function OwnerChip({ label, isActive, onClick }: OwnerChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className="rounded-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Badge
        variant={isActive ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer font-normal capitalize',
          !isActive && 'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {label}
      </Badge>
    </button>
  );
}

/**
 * Build a compact pagination list with leading/trailing ellipses, matching the
 * common 1 ... 4 5 6 ... 20 pattern. Always includes first and last page.
 */
function buildPageList(
  current: number,
  total: number
): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}
