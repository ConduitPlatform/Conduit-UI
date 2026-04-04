'use client';

import { FolderOpen, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NoContainerSelected({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <HardDrive className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No container selected</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Select a storage container to browse its files and folders.
      </p>
      {onSelect && (
        <Button variant="outline" className="mt-4" onClick={onSelect}>
          Select Container
        </Button>
      )}
    </div>
  );
}

export function EmptyFolder({
  onUpload,
  onCreateFolder,
}: {
  onUpload?: () => void;
  onCreateFolder?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">This folder is empty</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Upload files or create folders to get started.
      </p>
      <div className="flex gap-2 mt-4">
        {onUpload && (
          <Button variant="outline" onClick={onUpload}>
            Upload File
          </Button>
        )}
        {onCreateFolder && (
          <Button variant="outline" onClick={onCreateFolder}>
            Create Folder
          </Button>
        )}
      </div>
    </div>
  );
}
