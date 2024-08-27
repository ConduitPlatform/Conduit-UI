'use client';

import { DataType } from '@/components/storage/units/file/table/data-table';
import { useSearchParams } from 'next/navigation';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useEffect } from 'react';
import { FileIcon, FileImageIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FileDetails } from '@/components/storage/units/file/details';
import { Pagination } from '@/components/storage/units/file/pagination';
import { FILES_LIMIT } from '@/components/storage/units/file/utils';

type FileGalleryViewProps = {
  refreshFiles: (path: string, container: string) => Promise<DataType>;
};

export const FilesGalleryView = ({ refreshFiles }: FileGalleryViewProps) => {
  const searchParams = useSearchParams();
  const { currentPath, files, navigateFiles } = useFileSystemActions();

  useEffect(() => {
    const container = searchParams.get('container');
    if (container) {
      refreshFiles(currentPath, container).then(res => {
        navigateFiles({ ...res });
      });
    }
  }, [searchParams, currentPath]);

  return (
    <>
      <div className="mt-5 grid grid-cols-5 gap-14">
        {files.files.map(file => (
          <Sheet>
            <SheetTrigger asChild>
              <div className="flex flex-col items-center space-y-2">
                {file.mimeType.startsWith('image') ? (
                  <FileImageIcon className="w-28 h-28" />
                ) : (
                  <FileIcon className="w-28 h-28" />
                )}
                <span>{file.alias}</span>
              </div>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-[650px]">
              <SheetHeader>
                <SheetTitle>Details</SheetTitle>
              </SheetHeader>
              <FileDetails file={file} />
            </SheetContent>
          </Sheet>
        ))}
      </div>
      <Pagination data={files} limit={FILES_LIMIT} />
    </>
  );
};
