'use client';

import * as React from 'react';
import { FilterCondition } from './index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Search, Trash2 } from 'lucide-react';

type QueryBuilderProps = {
  schemaFields: string[];
  filters: FilterCondition[];
  onAddFilter: (filter: FilterCondition) => void;
  onRemoveFilter: (filterId: string) => void;
  onApply: () => void;
  onClose: () => void;
};

const operators = [
  { value: 'eq', label: 'equals' },
  { value: 'ne', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater than or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less than or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'regex', label: 'regex' },
] as const;

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function QueryBuilder({
  schemaFields,
  filters,
  onAddFilter,
  onRemoveFilter,
  onApply,
  onClose,
}: QueryBuilderProps) {
  const [newField, setNewField] = React.useState<string>('');
  const [newOperator, setNewOperator] =
    React.useState<FilterCondition['operator']>('eq');
  const [newValue, setNewValue] = React.useState('');

  const handleAddFilter = () => {
    if (!newField || !newValue) return;

    onAddFilter({
      id: generateId(),
      field: newField,
      operator: newOperator,
      value: newValue,
    });

    // Reset form
    setNewField('');
    setNewOperator('eq');
    setNewValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFilter();
    }
  };

  return (
    <div className="border-b bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Query Builder</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Existing Filters */}
      {filters.length > 0 && (
        <div className="mb-4 space-y-2">
          {filters.map((filter, index) => (
            <div
              key={filter.id}
              className="flex items-center gap-2 p-2 bg-background rounded-md border"
            >
              {index > 0 && (
                <Badge variant="secondary" className="text-xs">
                  AND
                </Badge>
              )}
              <Badge variant="outline">{filter.field}</Badge>
              <span className="text-sm text-muted-foreground">
                {operators.find(o => o.value === filter.operator)?.label}
              </span>
              <Badge variant="secondary">{filter.value}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto"
                onClick={() => onRemoveFilter(filter.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Filter */}
      <div className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <Label className="text-xs">Field</Label>
          <Select value={newField} onValueChange={setNewField}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select field..." />
            </SelectTrigger>
            <SelectContent>
              {schemaFields.map(field => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-[180px]">
          <Label className="text-xs">Operator</Label>
          <Select
            value={newOperator}
            onValueChange={v =>
              setNewOperator(v as FilterCondition['operator'])
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map(op => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <Label className="text-xs">Value</Label>
          <Input
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter value..."
            className="h-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddFilter}
          disabled={!newField || !newValue}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </Button>

        <div className="ml-auto">
          <Button onClick={onApply} size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
