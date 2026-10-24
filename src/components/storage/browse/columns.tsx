'use client';

import { ColumnDef } from '@tanstack/react-table';
import { BrowseItem } from './StorageBrowseProvider';
import {
  Folder as FolderIcon,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  FileCode,
  File as FileIcon,
} from 'lucide-react';
import { mimeTypeMapper } from '@/components/storage/units/file/utils';
import Decimal from 'decimal.js';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${new Decimal(bytes).div(Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.includes('zip') || mimeType.includes('archive'))
    return FileArchive;
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('xml') ||
    mimeType.includes('css') ||
    mimeType.includes('html')
  )
    return FileCode;
  if (mimeType.startsWith('text/') || mimeType.includes('pdf')) return FileText;
  return FileIcon;
}

function getItemName(item: BrowseItem): string {
  if (item.kind === 'folder') {
    const trimmed = item.data.name.replace(/\/$/, '');
    const parts = trimmed.split('/');
    return parts[parts.length - 1];
  }
  return item.data.alias || item.data.name;
}

export const columns: ColumnDef<BrowseItem>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const item = row.original;
      const name = getItemName(item);

      if (item.kind === 'folder') {
        return (
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{name}</span>
          </div>
        );
      }

      const Icon = getMimeIcon(item.data.mimeType);
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      );
    },
  },
  {
    id: 'size',
    header: 'Size',
    cell: ({ row }) => {
      if (row.original.kind === 'folder')
        return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {formatFileSize(row.original.data.size)}
        </span>
      );
    },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      if (row.original.kind === 'folder')
        return <span className="text-sm text-muted-foreground">Folder</span>;
      const mime = row.original.data.mimeType;
      return <span className="text-sm">{mimeTypeMapper[mime] ?? mime}</span>;
    },
  },
  {
    id: 'modified',
    header: 'Modified',
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.data.updatedAt)}</span>
    ),
  },
  {
    id: 'visibility',
    header: 'Visibility',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.data.isPublic ? 'Public' : 'Private'}
      </span>
    ),
  },
];

export { formatFileSize, formatDate, getItemName, getMimeIcon };
