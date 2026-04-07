'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DeclaredSchema } from '@/lib/models/database';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  ChevronDown,
  Plus,
  Search,
  FileJson,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ModelSwitcherProps = {
  schemas: DeclaredSchema[];
  modules: string[];
  selectedSchema: DeclaredSchema | null;
  onSelect: (modelId: string) => void;
  onCreateNew: () => void;
};

export function ModelSwitcher({
  schemas,
  modules,
  selectedSchema,
  onSelect,
  onCreateNew,
}: ModelSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Cmd+K is reserved for the global command palette.
  // This switcher is opened via its trigger button.

  // Filter schemas based on search
  const filteredSchemas = React.useMemo(() => {
    if (!search) return schemas;
    const searchLower = search.toLowerCase();
    return schemas.filter(
      schema =>
        schema.name.toLowerCase().includes(searchLower) ||
        schema.ownerModule.toLowerCase().includes(searchLower)
    );
  }, [schemas, search]);

  // Group schemas by owner module
  const groupedSchemas = React.useMemo(() => {
    const groups: Record<string, DeclaredSchema[]> = {};
    filteredSchemas.forEach(schema => {
      const ownerKey = schema.ownerModule || 'database';
      if (!groups[ownerKey]) {
        groups[ownerKey] = [];
      }
      groups[ownerKey].push(schema);
    });
    return groups;
  }, [filteredSchemas]);

  const handleSelect = (modelId: string) => {
    setOpen(false);
    setSearch('');
    onSelect(modelId);
  };

  const handleCreateNew = () => {
    setOpen(false);
    setSearch('');
    onCreateNew();
  };

  return (
    <>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-label="Select a model"
        className="w-[280px] justify-between"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2 truncate">
          <Database className="h-4 w-4 shrink-0" />
          {selectedSchema ? (
            <>
              <span className="truncate font-medium">
                {selectedSchema.name}
              </span>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {selectedSchema.ownerModule}
              </Badge>
            </>
          ) : (
            <span className="text-muted-foreground">Select a model...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search models..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              <p className="text-muted-foreground">No models found.</p>
              <Button variant="link" className="mt-2" onClick={handleCreateNew}>
                Create a new model
              </Button>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Model
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Models grouped by module */}
          {Object.entries(groupedSchemas).map(([module, moduleSchemas]) => (
            <CommandGroup key={module} heading={module}>
              {moduleSchemas.map(schema => (
                <CommandItem
                  key={schema._id}
                  value={`${schema.name}-${schema._id}`}
                  onSelect={() => handleSelect(schema._id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        selectedSchema?._id === schema._id && 'font-medium'
                      )}
                    >
                      {schema.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {
                        Object.keys(
                          schema.compiledFields || schema.fields || {}
                        ).length
                      }{' '}
                      fields
                    </span>
                    {selectedSchema?._id === schema._id && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
