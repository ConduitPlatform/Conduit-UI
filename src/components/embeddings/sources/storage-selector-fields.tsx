'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getContainers, getFolders } from '@/lib/api/storage';
import { normalizeFolderPrefix } from '@/lib/models/embeddings/source';
import type { ContainerOption } from '@/lib/api/embeddings/source-options';
import { useFormContext, useWatch } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

export type { ContainerOption };

const ALL_FOLDERS_VALUE = '';
const ALL_FOLDERS_LABEL = 'All folders';

type StorageSelectorFieldsProps = {
  containers: ContainerOption[];
  disabled?: boolean;
  error?: string;
  truncated?: boolean;
  total?: number;
};

export function StorageSelectorFields({
  containers,
  disabled,
  error,
  truncated,
  total,
}: StorageSelectorFieldsProps) {
  const { control, setValue } = useFormContext<EmbeddingSourceFormValues>();
  const container = useWatch({ control, name: 'container' }) ?? '';
  const folderPrefix = useWatch({ control, name: 'folderPrefix' }) ?? '';
  const [extraContainers, setExtraContainers] = useState<ContainerOption[]>([]);
  const [folders, setFolders] = useState<{ name: string }[]>([]);
  const [folderError, setFolderError] = useState<string>();
  const [folderTruncated, setFolderTruncated] = useState(false);
  const [folderQuery, setFolderQuery] = useState('');

  const mergedContainers = useMemo(() => {
    const seen = new Set<string>();
    const next: ContainerOption[] = [];
    for (const item of [...containers, ...extraContainers]) {
      if (seen.has(item.name)) continue;
      seen.add(item.name);
      next.push(item);
    }
    return next;
  }, [containers, extraContainers]);

  useEffect(() => {
    if (!container || disabled) {
      setFolders([]);
      setFolderTruncated(false);
      return;
    }
    let cancelled = false;
    void getFolders({
      skip: 0,
      limit: 100,
      container,
      search: folderQuery || undefined,
    })
      .then(result => {
        if (cancelled) return;
        setFolderError(undefined);
        setFolders(result.folders.map(folder => ({ name: folder.name })));
        setFolderTruncated(result.folders.length < result.folderCount);
      })
      .catch(() => {
        if (cancelled) return;
        setFolders([]);
        setFolderTruncated(false);
        setFolderError(
          'Folders could not be loaded. All folders stays available, or type a prefix.'
        );
      });
    return () => {
      cancelled = true;
    };
  }, [container, disabled, folderQuery]);

  const containerOptions = useMemo(
    () =>
      mergedContainers.map(item => ({
        value: item.name,
        label: item.name,
      })),
    [mergedContainers]
  );

  const folderOptions = useMemo(() => {
    const options = [
      { value: ALL_FOLDERS_VALUE, label: ALL_FOLDERS_LABEL },
      ...folders.map(folder => {
        const value = normalizeFolderPrefix(folder.name) ?? folder.name;
        return { value, label: value };
      }),
    ];
    const current = normalizeFolderPrefix(folderPrefix);
    if (current && !options.some(option => option.value === current)) {
      options.push({ value: current, label: current });
    }
    const typed = normalizeFolderPrefix(folderQuery);
    if (typed && !options.some(option => option.value === typed)) {
      options.push({ value: typed, label: `Use ${typed}` });
    }
    return options;
  }, [folderPrefix, folderQuery, folders]);

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
                disabled={disabled || Boolean(error)}
                placeholder={
                  error ? 'Containers unavailable' : 'Select a container'
                }
                searchPlaceholder="Search containers"
                emptyLabel="No matching containers"
                ariaLabel="Container"
                onValueChange={next => {
                  field.onChange(next);
                  setValue('folderPrefix', '', { shouldDirty: true });
                }}
                onSearchChange={query => {
                  if (disabled) return;
                  const search = query.trim().toLowerCase();
                  if (!search || truncated === false) return;
                  void getContainers({ skip: 0, limit: 100 })
                    .then(result => {
                      setExtraContainers(
                        result.containers
                          .filter(item =>
                            item.name.toLowerCase().includes(search)
                          )
                          .map(item => ({ id: item._id, name: item.name }))
                      );
                    })
                    .catch(() => undefined);
                }}
              />
            </FormControl>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : truncated ? (
              <p className="text-xs text-muted-foreground">
                Showing {mergedContainers.length} of {total?.toLocaleString()}{' '}
                containers. Search to find others.
              </p>
            ) : null}
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
              Optional. A trailing slash keeps the prefix on a folder boundary.
              All folders includes every path in the container.
            </FormDescription>
            <FormControl>
              <SearchableCombobox
                id="source-folder"
                value={field.value ?? ALL_FOLDERS_VALUE}
                options={folderOptions}
                disabled={disabled || !container}
                placeholder={ALL_FOLDERS_LABEL}
                searchPlaceholder="Search folders"
                emptyLabel="No matching folders"
                ariaLabel="Folder prefix"
                onValueChange={next => {
                  field.onChange(normalizeFolderPrefix(next) ?? '');
                }}
                onSearchChange={setFolderQuery}
              />
            </FormControl>
            {folderError ? (
              <p className="text-sm text-muted-foreground">{folderError}</p>
            ) : folderTruncated ? (
              <p className="text-xs text-muted-foreground">
                Folder list is incomplete. Search or type a prefix.
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
