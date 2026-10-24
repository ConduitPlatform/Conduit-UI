'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListChecks, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormField } from './fields-table';

const NO_DEFAULT = '__none__';

type EnumValuesEditorProps = {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function valueTypeChoices(current: string | undefined): string[] {
  const value = current || 'String';
  if (value === 'String' || value === 'Number') return ['String', 'Number'];
  return [value, 'String', 'Number'];
}

export function EnumValuesEditor({
  field,
  onUpdate,
  disabled,
  open,
  onOpenChange,
}: EnumValuesEditorProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const isOpen = open !== undefined ? open : internalOpen;
  const values = field.enumValues ?? [];
  const valueType = field.enumValueType || 'String';
  const fieldLabel = field.name.trim() || 'field';

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    setInternalOpen(nextOpen);
    if (!nextOpen) setError(null);
  };

  const addValue = () => {
    const next = draft.trim();
    if (!next) {
      setError('Enter a value.');
      return;
    }
    if (valueType === 'Number' && !Number.isFinite(Number(next))) {
      setError('Enter a number.');
      return;
    }
    if (valueType === 'Boolean' && next !== 'true' && next !== 'false') {
      setError('Enter true or false.');
      return;
    }

    const stored = valueType === 'Number' ? String(Number(next)) : next;
    const duplicate =
      valueType === 'Number'
        ? values.some(value => Number(value) === Number(stored))
        : values.some(value => value.trim() === stored);
    if (duplicate) {
      setError(`${stored} is already in the list.`);
      return;
    }

    onUpdate({ enumValues: [...values, stored] });
    setDraft('');
    setError(null);
  };

  const removeValue = (value: string) => {
    onUpdate({
      enumValues: values.filter(item => item !== value),
      ...(field.default === value ? { default: '' } : {}),
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label={`Enum values for ${fieldLabel}`}
          className={cn(
            'h-8 w-full justify-between gap-2 px-2.5 text-xs font-normal',
            values.length === 0 && 'text-muted-foreground'
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5 shrink-0 text-syntax-operator" />
            <span className="truncate">
              {values.length > 0 ? values.join(', ') : 'Add values'}
            </span>
          </span>
          {values.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 font-medium tabular-nums text-[10px]"
            >
              {values.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Enum values</h4>
            <p className="text-xs text-muted-foreground">
              Documents can only store one of these values.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Value type</Label>
            <div className="flex flex-wrap gap-1.5">
              {valueTypeChoices(field.enumValueType).map(choice => (
                <Button
                  key={choice}
                  type="button"
                  size="sm"
                  variant={choice === valueType ? 'secondary' : 'outline'}
                  aria-pressed={choice === valueType}
                  disabled={disabled}
                  onClick={() => onUpdate({ enumValueType: choice })}
                >
                  {choice}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`enum-value-${field.id}`} className="text-sm">
              Add value
            </Label>
            <div className="flex gap-2">
              <Input
                id={`enum-value-${field.id}`}
                value={draft}
                disabled={disabled}
                placeholder={valueType === 'Number' ? '1' : 'draft'}
                aria-label={`New enum value for ${fieldLabel}`}
                className="h-8 font-mono text-sm"
                onChange={event => {
                  setDraft(event.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={event => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  addValue();
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={disabled || draft.trim() === ''}
                aria-label={`Add enum value to ${fieldLabel}`}
                onClick={addValue}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {values.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {values.map((value, index) => (
                <Badge
                  key={`${value}-${index}`}
                  variant="secondary"
                  className="gap-1 font-mono font-normal"
                >
                  {value}
                  <button
                    type="button"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${value} from ${fieldLabel}`}
                    disabled={disabled}
                    onClick={() => removeValue(value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Default</Label>
            <Select
              value={
                field.default && values.includes(field.default)
                  ? field.default
                  : NO_DEFAULT
              }
              onValueChange={value =>
                onUpdate({ default: value === NO_DEFAULT ? '' : value })
              }
              disabled={disabled || values.length === 0}
            >
              <SelectTrigger
                className="h-8"
                aria-label={`Default value for ${fieldLabel}`}
              >
                <SelectValue placeholder="No default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DEFAULT}>No default</SelectItem>
                {values
                  .filter(value => value !== '')
                  .map((value, index) => (
                    <SelectItem key={`${value}-${index}`} value={value}>
                      {value}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
