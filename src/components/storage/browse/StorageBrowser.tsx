'use client';

import { useState } from 'react';
import { useStorageBrowse } from './StorageBrowseProvider';
import { StorageToolbar } from './StorageToolbar';
import { StorageBreadcrumbs } from './StorageBreadcrumbs';
import { StorageTable } from './StorageTable';
import { StorageGrid } from './StorageGrid';
import { NoContainerSelected } from './StorageEmptyState';
import { UploadDialog } from './UploadDialog';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FileDetailsSheet } from './FileDetailsSheet';
import { Skeleton } from '@/components/ui/skeleton';

export function StorageBrowser() {
  const { container, viewMode, loading } = useStorageBrowse();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openFileDetails = (fileId: string) => {
    setSelectedFileId(fileId);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <StorageToolbar
        onUpload={() => setUploadOpen(true)}
        onCreateFolder={() => setCreateFolderOpen(true)}
      />

      {container && <StorageBreadcrumbs />}

      {!container ? (
        <NoContainerSelected />
      ) : loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : viewMode === 'list' ? (
        <StorageTable
          onFileSelect={openFileDetails}
          onUpload={() => setUploadOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />
      ) : (
        <StorageGrid
          onFileSelect={openFileDetails}
          onUpload={() => setUploadOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      <FileDetailsSheet
        fileId={selectedFileId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
