'use client';

import { createContext, useContext, useState } from 'react';
import * as React from 'react';
import { getFiles, getFolders } from '@/lib/api/storage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type FilesType = Awaited<ReturnType<typeof getFiles>>;
type FoldersType = Awaited<ReturnType<typeof getFolders>>;

type FileSystemContext = {
  navigateTo: (path: string, bullseye?: string) => void;
  navigateFiles: (files: FilesType) => void;
  navigateFolders: (folders: FoldersType) => void;
  files: FilesType;
  folders: FoldersType;
};

const FileSystemContext = createContext<FileSystemContext>({
  navigateTo: () => {},
  navigateFiles: () => {},
  navigateFolders: () => {},
  files: {
    files: [],
    filesCount: 0,
  },
  folders: {
    folders: [],
    folderCount: 0,
  },
});
export const useFileSystemActions = () => useContext(FileSystemContext);

export function FileSystemActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [files, setFiles] = useState<FilesType>({
    files: [],
    filesCount: 0,
  });
  const [folders, setFolders] = useState<FoldersType>({
    folders: [],
    folderCount: 0,
  });

  const navigateTo = (path: string, bullseye?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (bullseye) {
      params.set('fileName', bullseye);
    } else {
      params.delete('fileName');
    }
    params.delete('folderName');
    params.delete('skip');
    params.set('path', path);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const navigateFiles = (files: FilesType) => {
    setFiles(files);
  };
  const navigateFolders = (folders: FoldersType) => {
    setFolders(folders);
  };

  return (
    <FileSystemContext.Provider
      value={{
        navigateTo,
        navigateFiles,
        navigateFolders,
        files,
        folders,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}
