'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeclaredSchema } from '@/lib/models/database';
import { DataGrid } from './data-grid';
import { QueryBuilder } from './query-builder';
import { DocumentPanel } from './document-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  Trash2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/hooks/use-toast';
import { deleteSchemaDocument } from '@/lib/api/database';

type DataExplorerProps = {
  schema: DeclaredSchema;
  documents: {
    documents: any[];
    count: number;
  };
};

export type FilterCondition = {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: string;
};

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};

export function DataExplorer({ schema, documents }: DataExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = React.useState<FilterCondition[]>([]);
  const [sort, setSort] = React.useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [showQueryBuilder, setShowQueryBuilder] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<any | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [quickSearch, setQuickSearch] = React.useState('');

  // Get schema fields for column definitions
  const schemaFields = React.useMemo(() => {
    const fields = schema.compiledFields || schema.fields || {};
    return Object.keys(fields);
  }, [schema]);

  // Build query from filters
  const buildQuery = React.useCallback(() => {
    if (filters.length === 0) return {};

    const query: Record<string, any> = {};
    filters.forEach(filter => {
      const operatorMap: Record<string, string> = {
        eq: '$eq',
        ne: '$ne',
        gt: '$gt',
        gte: '$gte',
        lt: '$lt',
        lte: '$lte',
        contains: '$regex',
        regex: '$regex',
      };

      const op = operatorMap[filter.operator];
      if (filter.operator === 'eq') {
        query[filter.field] = filter.value;
      } else {
        query[filter.field] = { [op]: filter.value };
      }
    });

    return query;
  }, [filters]);

  // Apply filters to URL
  const applyFilters = React.useCallback(() => {
    const query = buildQuery();
    const params = new URLSearchParams(searchParams.toString());

    if (Object.keys(query).length > 0) {
      params.set('search', JSON.stringify(query));
    } else {
      params.delete('search');
    }
    params.delete('pageIndex'); // Reset to first page

    router.push(`?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [buildQuery, searchParams, router]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageIndex', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', pageSize.toString());
    params.delete('pageIndex');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAddFilter = (filter: FilterCondition) => {
    setFilters([...filters, filter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const handleClearFilters = () => {
    setFilters([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('pageIndex');
    router.push(`?${params.toString()}`, { scroll: false });
    router.refresh();
  };

  const handleRefresh = () => {
    router.refresh();
    toast({ title: 'Data refreshed' });
  };

  const handleRowClick = (document: any) => {
    setSelectedDocument(document);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedDocument(null);
    setIsCreatingNew(true);
  };

  const handleDocumentSaved = () => {
    setSelectedDocument(null);
    setIsCreatingNew(false);
    router.refresh();
  };

  const handleClosePanel = () => {
    setSelectedDocument(null);
    setIsCreatingNew(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedRows.length} document(s) from ${schema.name}? This cannot be undone.`
      )
    ) {
      return;
    }
    const n = selectedRows.length;
    try {
      for (const id of selectedRows) {
        await deleteSchemaDocument(schema.name, id);
      }
      setSelectedRows([]);
      toast({ title: `Deleted ${n} document(s)` });
      router.refresh();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: 'Delete failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;
    const subset = documents.documents.filter((d: { _id?: string }) =>
      selectedRows.includes(String(d._id))
    );
    const blob = new Blob([JSON.stringify(subset, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${subset.length} document(s)` });
  };

  const currentPage = Number(searchParams.get('pageIndex') || '0');
  const pageSize = Number(searchParams.get('limit') || '20');
  const totalPages = Math.ceil(documents.count / pageSize);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Quick search..."
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant={showQueryBuilder ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowQueryBuilder(!showQueryBuilder)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.length}
                </Badge>
              )}
            </Button>

            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="flex items-center gap-2">
                {filters.slice(0, 3).map(filter => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {filter.field} {filter.operator} {filter.value}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveFilter(filter.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.length > 3 && (
                  <Badge variant="outline">+{filters.length - 3} more</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {selectedRows.length} selected
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDeleteSelected}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportSelected}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* Create New */}
            <Button size="sm" onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
          </div>
        </div>

        {/* Query Builder */}
        {showQueryBuilder && (
          <QueryBuilder
            schemaFields={schemaFields}
            filters={filters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onApply={applyFilters}
            onClose={() => setShowQueryBuilder(false)}
          />
        )}

        {/* Data Grid */}
        <div className="flex-1 overflow-hidden">
          <DataGrid
            documents={documents.documents}
            schemaFields={schemaFields}
            schema={schema}
            selectedRows={selectedRows}
            onSelectRows={setSelectedRows}
            onRowClick={handleRowClick}
            quickSearch={quickSearch}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={documents.count}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Document Panel (slides in from right) */}
      {(selectedDocument || isCreatingNew) && (
        <div className="w-[500px] border-l bg-background">
          <DocumentPanel
            schema={schema}
            document={selectedDocument}
            isNew={isCreatingNew}
            onSave={handleDocumentSaved}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  );
}
