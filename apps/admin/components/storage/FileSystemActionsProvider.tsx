'use client';

import { createContext, useContext, useState } from 'react';
import * as React from 'react';
import { getFiles, getFolders } from '@/lib/api/storage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type FilesType = Awaited<ReturnType<typeof getFiles>>;
type FoldersType = Awaited<ReturnType<typeof getFolders>>;

type FileSystemContext = {
  navigateTo: (path: string) => void;
  navigateFiles: (files: FilesType) => void;
  navigateFolders: (folders: FoldersType) => void;
  currentPath: string;
  files: FilesType;
  folders: FoldersType;
};

const FileSystemContext = createContext<FileSystemContext>({
  navigateTo: () => {},
  navigateFiles: () => {},
  navigateFolders: () => {},
  currentPath: '',
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
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FilesType>({
    files: [],
    filesCount: 0,
  });
  const [folders, setFolders] = useState<FoldersType>({
    folders: [],
    folderCount: 0,
  });

  const navigateTo = (path: string) => {
    const params = new URLSearchParams();
    searchParams.forEach((v, key) => {
      if (key === 'container') {
        params.set(key, v);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
    setCurrentPath(path);
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
        currentPath,
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