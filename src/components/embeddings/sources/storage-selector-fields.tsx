'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getFolders } from '@/lib/api/storage';
import { useFormContext, useWatch } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

export type ContainerOption = {
  id: string;
  name: string;
};

type StorageSelectorFieldsProps = {
  containers: ContainerOption[];
  disabled?: boolean;
};

export function StorageSelectorFields({
  containers,
  disabled,
}: StorageSelectorFieldsProps) {
  const { control, setValue } = useFormContext<EmbeddingSourceFormValues>();
  const container = useWatch({ control, name: 'container' }) ?? '';
  const [folders, setFolders] = useState<{ name: string }[]>([]);
  const [folderError, setFolderError] = useState<string>();

  useEffect(() => {
    if (!container || disabled) {
      setFolders([]);
      return;
    }
    let cancelled = false;
    void getFolders({ skip: 0, limit: 100, container, search: '' })
      .then(result => {
        if (cancelled) return;
        setFolderError(undefined);
        setFolders(result.folders.map(folder => ({ name: folder.name })));
      })
      .catch(() => {
        if (cancelled) return;
        setFolders([]);
        setFolderError('Folders could not be loaded. Enter a prefix instead.');
      });
    return () => {
      cancelled = true;
    };
  }, [container, disabled]);

  const containerOptions = useMemo(
    () =>
      containers.map(item => ({
        value: item.name,
        label: item.name,
      })),
    [containers]
  );
  const folderOptions = useMemo(
    () => folders.map(folder => ({ value: folder.name, label: folder.name })),
    [folders]
  );

  return (
    <div className="grid gap-4">
      <FormField
        control={control}
        name="container"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Container</FormLabel>
            <FormDescription>
              Only files in this container are indexed.
            </FormDescription>
            <FormControl>
              <SearchableCombobox
                id="source-container"
                value={field.value ?? ''}
                options={containerOptions}
                disabled={disabled || containerOptions.length === 0}
                placeholder={
                  containerOptions.length === 0
                    ? 'No containers available'
                    : 'Select a container'
                }
                searchPlaceholder="Search containers"
                emptyLabel="No matching containers"
                ariaLabel="Container"
                onValueChange={next => {
                  field.onChange(next);
                  setValue('folderPrefix', '', { shouldDirty: true });
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="folderPrefix"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Folder prefix</FormLabel>
            <FormDescription>
              Optional. Files whose folder starts with this prefix are included.
            </FormDescription>
            {folderOptions.length > 0 ? (
              <FormControl>
                <SearchableCombobox
                  id="source-folder"
                  value={field.value ?? ''}
                  options={folderOptions}
                  disabled={disabled || !container}
                  placeholder="All folders"
                  searchPlaceholder="Search folders"
                  emptyLabel="No matching folders"
                  ariaLabel="Folder prefix"
                  onValueChange={field.onChange}
                />
              </FormControl>
            ) : null}
            <FormControl>
              <Input
                id="source-folder-prefix"
                value={field.value ?? ''}
                disabled={disabled}
                placeholder="invoices/"
                autoComplete="off"
                onChange={event => field.onChange(event.target.value)}
              />
            </FormControl>
            {folderError ? (
              <p className="text-sm text-muted-foreground">{folderError}</p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
