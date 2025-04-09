'use client';
import { Database, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeclaredSchema } from '@/lib/models/database';

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
    <div className="p-4 space-y-4 border-b">
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search queries..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="h-9"
        />
      </div>
      <Select
        value={selectedModel ?? 'all'}
        onValueChange={value => onModelChange(value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Filter by model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          {models.map(model => (
            <SelectItem key={model._id} value={model._id}>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                {model.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
