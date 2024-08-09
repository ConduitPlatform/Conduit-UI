'use client';

import { createContext, useContext, useState } from 'react';
import * as React from 'react';

type FileSystemContext = {
  navigateTo: (path: string) => void;
  currentPath: string;
};

const FileSystemContext = createContext<FileSystemContext>({
  navigateTo: () => {},
  currentPath: '',
});
export const useFileSystemActions = () => useContext(FileSystemContext);

export function FileSystemActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPath, setCurrentPath] = useState('');

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <FileSystemContext.Provider value={{ currentPath, navigateTo }}>
      {children}
    </FileSystemContext.Provider>
  );
}
