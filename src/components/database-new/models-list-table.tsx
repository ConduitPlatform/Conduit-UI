'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  onCreateNew: () => void;
  onSelect: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
};

export function ModelsListTable({
  schemas,
  modules,
  onCreateNew,
  onSelect,
  onDelete,
}: ModelsListTableProps) {
  const [search, setSearch] = React.useState('');

  const filteredSchemas = React.useMemo(() => {
    if (!search) return schemas;
    const searchLower = search.toLowerCase();
    return schemas.filter(
      schema =>
        schema.name.toLowerCase().includes(searchLower) ||
        schema.ownerModule.toLowerCase().includes(searchLower)
    );
  }, [schemas, search]);

  const getFieldCount = (schema: DeclaredSchema) => {
    const fields = schema.compiledFields || schema.fields || {};
    return Object.keys(fields).length;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Database Models</h1>
          </div>
          <Badge variant="secondary">{schemas.length} models</Badge>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Model
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredSchemas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileJson className="w-8 h-8 text-muted-foreground" />
            </div>
            {search ? (
              <>
                <p className="text-lg font-medium">No models found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No models match &quot;{search}&quot;
                </p>
                <Button
                  variant="link"
                  onClick={() => setSearch('')}
                  className="mt-2"
                >
                  Clear search
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
              {filteredSchemas.map(schema => (
                <TableRow
                  key={schema._id}
                  className="cursor-pointer"
                  onClick={() => onSelect(schema._id)}
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
                            onSelect(schema._id);
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
    </div>
  );
}
