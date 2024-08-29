'use client';

import {
  CommandDialog,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEffect, useState } from 'react';
import { getFiles, getFolders } from '@/lib/api/storage';
import { useSearchParams } from 'next/navigation';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';

export function GlobalSearch({
  refreshItems,
}: {
  refreshItems: (
    container: string,
    name?: string
  ) => Promise<{
    files: Awaited<ReturnType<typeof getFiles>>;
    folders: Awaited<ReturnType<typeof getFolders>>;
  }>;
}) {
  const { navigateTo } = useFileSystemActions();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(undefined);
  const [files, setFiles] = useState<Awaited<ReturnType<typeof getFiles>>>({
    files: [],
    filesCount: 0,
  });
  const [folders, setFolders] = useState<
    Awaited<ReturnType<typeof getFolders>>
  >({
    folders: [],
    folderCount: 0,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    const container = searchParams.get('container');
    if (container) {
      refreshItems(container, value).then(res => {
        setFolders(res.folders);
        setFiles(res.files);
      });
    }
  }, [value, searchParams]);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search for files and folders..."
          onValueChange={v => setValue(v)}
        />
        <CommandList>
          <CommandGroup heading="Files" key="files">
            {files.files.map(file => (
              <CommandItem
                key={`file-${file._id}`}
                value={file._id}
                onSelect={() => {
                  const trimmed = file.folder.replace(/\/$/, '');
                  navigateTo(`/${trimmed}`, file.name);
                  setOpen(!open);
                }}
              >
                <div className="flex flex-col">
                  <span>{file.alias}</span>
                  <span>{file.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Folders" key="folders">
            {folders.folders.map(folder => (
              <CommandItem
                key={`folder-${folder._id}`}
                onSelect={item => {
                  const trimmed = item.replace(/\/$/, '');
                  navigateTo(`/${trimmed}`);
                  setOpen(!open);
                }}
              >
                {folder.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
