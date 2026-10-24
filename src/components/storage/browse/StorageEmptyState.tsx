'use client';

import { FolderOpen, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export function NoContainerSelected({ onSelect }: { onSelect?: () => void }) {
  return (
    <EmptyState
      icon={HardDrive}
      title="No container selected"
      description="Select a storage container to browse its files and folders."
      action={
        onSelect ? (
          <Button variant="outline" onClick={onSelect}>
            Select Container
          </Button>
        ) : undefined
      }
    />
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
    <EmptyState
      icon={FolderOpen}
      title="This folder is empty"
      description="Upload files or create folders to get started."
      action={
        <div className="flex gap-2">
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
      }
    />
  );
}
