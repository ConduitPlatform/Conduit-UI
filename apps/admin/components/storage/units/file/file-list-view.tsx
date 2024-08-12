'use client';

import { useSearchParams } from 'next/navigation';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useEffect, useState } from 'react';
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
  const { currentPath } = useFileSystemActions();
  const [files, setFiles] = useState<DataType>({
    files: [],
    filesCount: 0,
  });

  useEffect(() => {
    const container = searchParams.get('container');
    if (container) {
      refreshFiles(currentPath, container).then(res => {
        setFiles(res);
      });
    }
  }, [searchParams, currentPath]);

  return <FilesTable columns={columns} data={files} />;
};
