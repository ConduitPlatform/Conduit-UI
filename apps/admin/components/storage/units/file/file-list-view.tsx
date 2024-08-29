'use client';

import { useSearchParams } from 'next/navigation';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useEffect } from 'react';
import {
  DataType,
  FilesTable,
} from '@/components/storage/units/file/table/data-table';
import { columns } from '@/components/storage/units/file/table/columns';

type FileListViewProps = {
  refreshFiles: (path: string, container: string) => Promise<DataType>;
};

export const FileListView = ({ refreshFiles }: FileListViewProps) => {
  const searchParams = useSearchParams();
  const { files, navigateFiles } = useFileSystemActions();

  useEffect(() => {
    const container = searchParams.get('container');
    const currentPath = searchParams.get('path') ?? '';
    if (container) {
      refreshFiles(currentPath, container).then(res => {
        navigateFiles(res);
      });
    }
  }, [searchParams]);

  return <FilesTable columns={columns} data={files} />;
};
