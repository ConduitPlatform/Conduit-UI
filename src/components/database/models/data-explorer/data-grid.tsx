'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { updateSchemaDocument } from '@/lib/api/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/hooks/use-toast';
import moment from 'moment';
import type { ModelDataPermissions } from './permissions';

type DataGridProps = {
  documents: any[];
  schemaFields: string[];
  schema: DeclaredSchema;
  permissions: ModelDataPermissions;
  selectedRows: string[];
  onSelectRows: (rows: string[]) => void;
  onRowClick: (document: any) => void;
  quickSearch: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

// Cell for inline editing
function EditableCell({
  value,
  documentId,
  fieldName,
  schemaName,
  canEdit,
  onSave,
}: {
  value: any;
  documentId: string;
  fieldName: string;
  schemaName: string;
  canEdit: boolean;
  onSave: () => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value ?? ''));
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (editValue === String(value ?? '')) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateSchemaDocument(schemaName, documentId, {
        [fieldName]: editValue,
      });
      toast({ title: 'Value updated' });
      onSave();
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(String(value ?? ''));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-7 text-xs"
          disabled={isSaving}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setEditValue(String(value ?? ''));
            setIsEditing(false);
          }}
          disabled={isSaving}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1">
      <span className="truncate">{formatCellValue(value)}</span>
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

// Format cell values for display
function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'object') {
    // Handle MongoDB date
    if (value.$date) {
      return moment(value.$date).format('MMM D, YYYY HH:mm');
    }
    // Handle MongoDB ObjectId
    if (value.$oid) {
      return value.$oid.substring(0, 8) + '...';
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    // Handle objects
    return JSON.stringify(value).substring(0, 50) + '...';
  }

  // Handle ISO date strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return moment(value).format('MMM D, YYYY HH:mm');
  }

  return String(value);
}

// Check if value looks like an ObjectId
function isObjectId(value: any): boolean {
  if (typeof value === 'object' && value?.$oid) return true;
  if (typeof value === 'string' && /^[a-f0-9]{24}$/.test(value)) return true;
  return false;
}

export function DataGrid({
  documents,
  schemaFields,
  schema,
  permissions,
  selectedRows,
  onSelectRows,
  onRowClick,
  quickSearch,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataGridProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Filter documents by quick search
  const filteredDocuments = React.useMemo(() => {
    if (!quickSearch) return documents;
    const searchLower = quickSearch.toLowerCase();
    return documents.filter(doc =>
      Object.values(doc).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [documents, quickSearch]);

  // Get all unique columns from documents
  const columns = React.useMemo(() => {
    const allKeys = new Set<string>();
    allKeys.add('_id');
    schemaFields.forEach(key => allKeys.add(key));
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => allKeys.add(key));
    });
    // Move _id to front, __v and timestamps to end
    const sorted = Array.from(allKeys).filter(
      k => k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt'
    );
    return ['_id', ...sorted, 'createdAt', 'updatedAt'].filter(k =>
      allKeys.has(k)
    );
  }, [documents, schemaFields]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectRows(filteredDocuments.map(doc => doc._id));
    } else {
      onSelectRows([]);
    }
  };

  const handleSelectRow = (docId: string, checked: boolean) => {
    if (checked) {
      onSelectRows([...selectedRows, docId]);
    } else {
      onSelectRows(selectedRows.filter(id => id !== docId));
    }
  };

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleRefresh = () => {
    // Trigger re-render by refreshing
    window.location.reload();
  };

  const allSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every(doc => selectedRows.includes(doc._id));
  const someSelected =
    selectedRows.length > 0 &&
    !allSelected &&
    filteredDocuments.some(doc => selectedRows.includes(doc._id));

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'opacity-50' : ''}
                />
              </TableHead>
              {columns.map(column => (
                <TableHead
                  key={column}
                  className={cn(
                    'min-w-[120px]',
                    column === '_id' && 'w-[180px]',
                    (column === 'createdAt' || column === 'updatedAt') &&
                      'w-[160px]'
                  )}
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-32 text-center text-muted-foreground"
                >
                  {quickSearch
                    ? 'No documents match your search'
                    : 'No documents found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map(doc => (
                <TableRow
                  key={doc._id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    selectedRows.includes(doc._id) && 'bg-muted/30'
                  )}
                  onClick={() => onRowClick(doc)}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.includes(doc._id)}
                      onCheckedChange={checked =>
                        handleSelectRow(doc._id, checked as boolean)
                      }
                      aria-label={`Select row ${doc._id}`}
                    />
                  </TableCell>
                  {columns.map(column => (
                    <TableCell key={column} className="max-w-[250px]">
                      {column === '_id' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs cursor-pointer hover:bg-muted"
                                  onClick={e => handleCopyId(doc._id, e)}
                                >
                                  {copiedId === doc._id ? (
                                    <Check className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Copy className="w-3 h-3 mr-1" />
                                  )}
                                  {doc._id.substring(0, 8)}...
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{doc._id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : isObjectId(doc[column]) ? (
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {typeof doc[column] === 'object'
                            ? doc[column].$oid?.substring(0, 8)
                            : doc[column].substring(0, 8)}
                          ...
                        </Badge>
                      ) : column === 'createdAt' || column === 'updatedAt' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-xs text-muted-foreground">
                              {formatCellValue(doc[column])}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{doc[column]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : doc[column] === null || doc[column] === undefined ? (
                        <span className="text-muted-foreground text-xs italic">
                          NULL
                        </span>
                      ) : typeof doc[column] === 'object' ? (
                        <Badge variant="outline" className="text-xs">
                          {formatCellValue(doc[column])}
                        </Badge>
                      ) : (
                        <div
                          className="truncate text-sm"
                          onClick={e => e.stopPropagation()}
                        >
                          <EditableCell
                            value={doc[column]}
                            documentId={doc._id}
                            fieldName={column}
                            schemaName={schema.name}
                            canEdit={permissions.canModifyField(column)}
                            onSave={handleRefresh}
                          />
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={value => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
