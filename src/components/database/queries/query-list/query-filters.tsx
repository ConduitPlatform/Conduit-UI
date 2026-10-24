'use client';

import { Database, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DeclaredSchema } from '@/lib/models/database';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';

interface QueryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModel?: string;
  onModelChange: (value: string) => void;
  models: DeclaredSchema[];
}

export function QueryFilters({
  searchTerm,
  onSearchChange,
  selectedModel,
  onModelChange,
  models,
}: Readonly<QueryFiltersProps>) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="query-search" className="sr-only">
          Search queries
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="query-search"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <Label
            htmlFor="query-model-filter"
            className="text-xs text-muted-foreground"
          >
            Model
          </Label>
          <QueryFieldHint content="Show only endpoints that query a specific schema." />
        </div>
        <Select
          value={selectedModel ?? 'all'}
          onValueChange={value => onModelChange(value)}
        >
          <SelectTrigger id="query-model-filter" className="h-9">
            <SelectValue placeholder="Filter by model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All models</SelectItem>
              {models.map(model => (
                <SelectItem key={model._id} value={model.name}>
                  <div className="flex items-center">
                    <Database className="mr-2 size-4" />
                    {model.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
