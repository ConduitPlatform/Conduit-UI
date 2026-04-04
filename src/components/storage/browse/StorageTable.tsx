'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  MoreHorizontal,
  FolderOpen,
  Eye,
  Copy,
  Download,
  Trash2,
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
import { columns } from './columns';
import { StoragePagination } from './StoragePagination';
import { EmptyFolder } from './StorageEmptyState';
import { getFileUrl } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';

export function StorageTable({
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<BrowseItem | null>(null);

  const data = useMemo<BrowseItem[]>(() => {
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

  const allColumns = useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }: { row: { original: BrowseItem } }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.kind === 'folder' ? (
                  <DropdownMenuItem
                    onClick={() => {
                      const trimmed = item.data.name.replace(/\/$/, '');
                      navigateTo(`/${trimmed}`);
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open Folder
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => onFileSelect(item.data._id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
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
          );
        },
      },
    ],
    [navigateTo, onFileSelect, toast]
  );

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const handleRowClick = (item: BrowseItem) => {
    if (item.kind === 'folder') {
      const trimmed = item.data.name.replace(/\/$/, '');
      navigateTo(`/${trimmed}`);
    } else {
      onFileSelect(item.data._id);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'file') {
      await deleteFile(deleteTarget.data._id);
    } else {
      await removeFolderFromList(deleteTarget.data._id);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-1'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() &&
                          (header.column.getIsSorted() === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          ))}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      onClick={
                        cell.column.id === 'actions'
                          ? e => e.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  <EmptyFolder
                    onUpload={onUpload}
                    onCreateFolder={onCreateFolder}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
