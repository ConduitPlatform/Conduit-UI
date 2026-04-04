'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Folder as FolderIcon,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useStorageBrowse, BrowseItem } from './StorageBrowseProvider';
import { getItemName, getMimeIcon, formatFileSize } from './columns';
import { StoragePagination } from './StoragePagination';
import { EmptyFolder } from './StorageEmptyState';
import { getFileUrl } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';

export function StorageGrid({
  onFileSelect,
  onUpload,
  onCreateFolder,
}: {
  onFileSelect: (fileId: string) => void;
  onUpload: () => void;
  onCreateFolder: () => void;
}) {
  const { folders, files, navigateTo, deleteFile, removeFolderFromList } =
    useStorageBrowse();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<BrowseItem | null>(null);

  const items = useMemo<BrowseItem[]>(() => {
    const folderItems: BrowseItem[] = folders.map(f => ({
      kind: 'folder' as const,
      data: f,
    }));
    const fileItems: BrowseItem[] = files.map(f => ({
      kind: 'file' as const,
      data: f,
    }));
    return [...folderItems, ...fileItems];
  }, [folders, files]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'file') {
      await deleteFile(deleteTarget.data._id);
    } else {
      await removeFolderFromList(deleteTarget.data._id);
    }
    setDeleteTarget(null);
  };

  if (items.length === 0) {
    return <EmptyFolder onUpload={onUpload} onCreateFolder={onCreateFolder} />;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map(item => {
          const name = getItemName(item);
          const isFolder = item.kind === 'folder';
          const FileTypeIcon = isFolder
            ? null
            : getMimeIcon(item.data.mimeType);

          return (
            <Card
              key={item.data._id}
              className="group relative flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 transition-colors gap-0"
              onClick={() => {
                if (isFolder) {
                  const trimmed = item.data.name.replace(/\/$/, '');
                  navigateTo(`/${trimmed}`);
                } else {
                  onFileSelect(item.data._id);
                }
              }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={e => e.stopPropagation()}
                  >
                    {isFolder ? (
                      <DropdownMenuItem
                        onClick={() => {
                          const trimmed = item.data.name.replace(/\/$/, '');
                          navigateTo(`/${trimmed}`);
                        }}
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => onFileSelect(item.data._id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const res = await getFileUrl(item.data._id);
                            await navigator.clipboard.writeText(res.result);
                            toast({
                              title: 'Storage',
                              description: 'URL copied to clipboard',
                            });
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const res = await getFileUrl(item.data._id);
                            window.open(res.result, '_blank');
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-center h-16 w-16 mb-2">
                {isFolder ? (
                  <FolderIcon className="h-10 w-10 text-muted-foreground" />
                ) : (
                  FileTypeIcon && (
                    <FileTypeIcon className="h-10 w-10 text-muted-foreground" />
                  )
                )}
              </div>
              <span className="text-sm font-medium truncate w-full text-center">
                {name}
              </span>
              {!isFolder && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(item.data.size)}
                </span>
              )}
            </Card>
          );
        })}
      </div>
      <StoragePagination />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.kind === 'folder' ? 'Folder' : 'File'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{' '}
              {deleteTarget?.kind === 'folder' ? 'folder' : 'file'}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
