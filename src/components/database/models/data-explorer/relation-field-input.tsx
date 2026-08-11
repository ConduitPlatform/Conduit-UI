'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Check, X, Loader2, Search, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchemaDocs } from '@/lib/api/database';
import { formatDisplayValue } from '@/lib/database/format-display-value';

type RelationFieldInputProps = {
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  relatedModel: string;
  isArray?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export function RelationFieldInput({
  value,
  onChange,
  relatedModel,
  isArray = false,
  disabled,
  placeholder = 'Select document...',
}: RelationFieldInputProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch documents when popover opens
  React.useEffect(() => {
    if (open && relatedModel) {
      setLoading(true);
      setError(null);
      getSchemaDocs(relatedModel, { query: {} }, { limit: 50 })
        .then(result => {
          setDocuments(result.documents || []);
        })
        .catch(err => {
          setError('Failed to load documents');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, relatedModel]);

  // Filter documents based on search
  const filteredDocuments = React.useMemo(() => {
    if (!search) return documents;
    const searchLower = search.toLowerCase();
    return documents.filter(doc => {
      // Search in _id and common fields
      const searchableFields = ['_id', 'name', 'title', 'email', 'label'];
      return searchableFields.some(field => {
        const fieldValue = doc[field];
        if (fieldValue) {
          return String(fieldValue).toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [documents, search]);

  // Get display value for a document (always a string — never raw objects)
  const getDocumentDisplay = (doc: any): string => {
    const displayFields = ['name', 'title', 'email', 'label', 'username'];
    for (const field of displayFields) {
      const fieldValue = doc[field];
      if (
        typeof fieldValue === 'string' ||
        typeof fieldValue === 'number' ||
        typeof fieldValue === 'boolean'
      ) {
        return String(fieldValue);
      }
    }
    if (typeof doc._id === 'string') {
      return `${doc._id.substring(0, 12)}...`;
    }
    return formatDisplayValue(doc._id);
  };

  // Handle selection
  const handleSelect = (docId: string) => {
    if (isArray) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(docId)) {
        onChange(currentValues.filter(v => v !== docId));
      } else {
        onChange([...currentValues, docId]);
      }
    } else {
      onChange(docId);
      setOpen(false);
    }
  };

  // Handle removal
  const handleRemove = (docId: string) => {
    if (isArray) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter(v => v !== docId));
    } else {
      onChange(null);
    }
  };

  // Check if a document is selected
  const isSelected = (docId: string) => {
    if (isArray) {
      return Array.isArray(value) && value.includes(docId);
    }
    return value === docId;
  };

  // Find selected documents for display
  const selectedDocs = React.useMemo(() => {
    if (!value) return [];
    const ids = Array.isArray(value) ? value : [value];
    return ids.map(id => {
      const doc = documents.find(d => d._id === id);
      return doc || { _id: id };
    });
  }, [value, documents]);

  // For single selection
  if (!isArray) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
              {value ? (
                <>
                  <FileJson className="w-4 h-4 shrink-0 text-primary" />
                  <span className="truncate font-mono text-xs">
                    {formatDisplayValue(value)}
                  </span>
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${relatedModel}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div className="py-6 text-center text-sm text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && filteredDocuments.length === 0 && (
                <CommandEmpty>No documents found.</CommandEmpty>
              )}
              {!loading && !error && filteredDocuments.length > 0 && (
                <CommandGroup>
                  {filteredDocuments.map(doc => (
                    <CommandItem
                      key={doc._id}
                      value={doc._id}
                      onSelect={() => handleSelect(doc._id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileJson className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">
                            {getDocumentDisplay(doc)}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {doc._id}
                          </span>
                        </div>
                      </div>
                      {isSelected(doc._id) && (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // For array selection
  return (
    <div className="space-y-2">
      {/* Selected documents */}
      {selectedDocs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedDocs.map(doc => (
            <Badge
              key={doc._id}
              variant="secondary"
              className="gap-1 pr-1 font-mono text-xs"
            >
              {doc._id?.substring(0, 8)}...
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(doc._id)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={disabled}
          >
            <Search className="w-4 h-4" />
            Add from {relatedModel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${relatedModel}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div className="py-6 text-center text-sm text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && filteredDocuments.length === 0 && (
                <CommandEmpty>No documents found.</CommandEmpty>
              )}
              {!loading && !error && filteredDocuments.length > 0 && (
                <CommandGroup>
                  {filteredDocuments.map(doc => (
                    <CommandItem
                      key={doc._id}
                      value={doc._id}
                      onSelect={() => handleSelect(doc._id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileJson className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">
                            {getDocumentDisplay(doc)}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {doc._id}
                          </span>
                        </div>
                      </div>
                      {isSelected(doc._id) && (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
