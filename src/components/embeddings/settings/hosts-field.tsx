'use client';

import { KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { normalizeHost } from '@/lib/models/embeddings/settings-form';

type HostsFieldName = 'allowedHosts' | 'security.sourceFieldAllowlist';

type HostsFieldProps = {
  name: HostsFieldName;
  label: string;
  description: string;
  disabled?: boolean;
  placeholder?: string;
};

export function HostsField({
  name,
  label,
  description,
  disabled = false,
  placeholder = 'Add a host and press Enter',
}: HostsFieldProps) {
  const { control } = useFormContext();
  const [draft, setDraft] = useState('');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hosts = Array.isArray(field.value)
          ? field.value.filter(item => typeof item === 'string')
          : [];

        const commit = (raw: string) => {
          const host = normalizeHost(raw);
          if (!host) return;
          if (hosts.includes(host)) {
            setDraft('');
            return;
          }
          field.onChange([...hosts, host]);
          setDraft('');
        };

        const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
            if (!draft.trim()) return;
            event.preventDefault();
            commit(draft);
            return;
          }
          if (event.key === 'Escape' && draft) {
            event.preventDefault();
            event.stopPropagation();
            setDraft('');
            return;
          }
          if (event.key === 'Backspace' && !draft && hosts.length > 0) {
            field.onChange(hosts.slice(0, -1));
          }
        };

        return (
          <FormItem className="space-y-1.5">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div
                className={cn(
                  'flex min-h-8 flex-wrap items-center gap-1.5 rounded-md border border-input bg-surface-1 px-2 py-1',
                  disabled && 'opacity-50'
                )}
              >
                {hosts.map(host => (
                  <span
                    key={host}
                    className="inline-flex min-h-8 items-center gap-1 rounded-md bg-secondary px-2 text-[13px] text-secondary-foreground"
                  >
                    {host}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                      disabled={disabled}
                      aria-label={`Remove ${host}`}
                      onClick={() =>
                        field.onChange(hosts.filter(item => item !== host))
                      }
                    >
                      <X className="size-3.5" aria-hidden />
                    </Button>
                  </span>
                ))}
                <Input
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  onKeyDown={onKeyDown}
                  onBlur={() => {
                    if (draft.trim()) commit(draft);
                    field.onBlur();
                  }}
                  disabled={disabled}
                  placeholder={hosts.length === 0 ? placeholder : undefined}
                  autoComplete="off"
                  aria-label={`Add ${label.toLowerCase()}`}
                  className="h-8 min-w-40 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs">{description}</FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
