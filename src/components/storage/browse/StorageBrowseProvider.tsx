'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getContainers,
  getFiles,
  getFolders,
  deleteFileById,
  deleteFolder,
} from '@/lib/api/storage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ConduitFile, Container, Folder } from '@/lib/models/storage';
import { useToast } from '@/lib/hooks/use-toast';

export type BrowseItem =
  | { kind: 'folder'; data: Folder }
  | { kind: 'file'; data: ConduitFile };

type ViewMode = 'list' | 'grid';

const ITEMS_PER_PAGE = 25;

type StorageBrowseState = {
  containers: Container[];
  container: string | null;
  path: string;
  search: string;
  viewMode: ViewMode;
  folders: Folder[];
  folderCount: number;
  files: ConduitFile[];
  filesCount: number;
  page: number;
  loading: boolean;
};

type StorageBrowseActions = {
  setContainer: (name: string) => void;
  navigateTo: (path: string) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  refreshContainers: () => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  removeFolderFromList: (id: string) => Promise<void>;
  addFileToList: (file: ConduitFile) => void;
  addFolderToList: (folder: Folder) => void;
  itemsPerPage: number;
};

type StorageBrowseContextType = StorageBrowseState & StorageBrowseActions;

const StorageBrowseContext = createContext<StorageBrowseContextType | null>(
  null
);

export function useStorageBrowse() {
  const ctx = useContext(StorageBrowseContext);
  if (!ctx)
    throw new Error(
      'useStorageBrowse must be used within StorageBrowseProvider'
    );
  return ctx;
}

export function StorageBrowseProvider({
  children,
  initialContainers,
}: {
  children: ReactNode;
  initialContainers: Container[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [containers, setContainers] = useState<Container[]>(initialContainers);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderCount, setFolderCount] = useState(0);
  const [files, setFiles] = useState<ConduitFile[]>([]);
  const [filesCount, setFilesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const container = searchParams.get('container');
  const path = searchParams.get('path') ?? '';
  const search = searchParams.get('search') ?? '';
  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const next = params.toString();
      if (next === searchParams.toString()) return;
      router.replace(next ? `${pathname}?${next}` : pathname);
    },
    [searchParams, pathname, router]
  );

  const fetchData = useCallback(async () => {
    if (!container) return;
    setLoading(true);
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const [foldersRes, filesRes] = await Promise.all([
        getFolders({
          skip: 0,
          limit: 100,
          sort: '-createdAt',
          parent: path,
          container,
          search: search || undefined,
        }),
        getFiles({
          skip,
          limit: ITEMS_PER_PAGE,
          container,
          folder: path.replace(/^\/|\/$/g, '') || undefined,
          search: search || undefined,
          sort: '-createdAt',
        }),
      ]);
      setFolders(foldersRes.folders);
      setFolderCount(foldersRes.folderCount);
      setFiles(filesRes.files);
      setFilesCount(filesRes.filesCount);
    } catch {
      toast({
        title: 'Storage',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [container, path, search, page, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setContainer = useCallback(
    (name: string) => {
      updateParams({ container: name, path: null, search: null, page: null });
    },
    [updateParams]
  );

  const navigateTo = useCallback(
    (newPath: string) => {
      updateParams({ path: newPath || null, search: null, page: null });
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (value: string) => {
      const next = value.trim();
      const current = searchParams.get('search') ?? '';
      if (next === current) return;
      updateParams({ search: next || null, page: null });
    },
    [searchParams, updateParams]
  );

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      const current = (searchParams.get('view') as ViewMode | null) || 'list';
      if (current === mode) return;
      updateParams({ view: mode === 'list' ? null : mode });
    },
    [searchParams, updateParams]
  );

  const setPage = useCallback(
    (p: number) => {
      updateParams({ page: p <= 1 ? null : String(p) });
    },
    [updateParams]
  );

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const refreshContainers = useCallback(async () => {
    const res = await getContainers({ skip: 0, limit: 100 });
    setContainers(res.containers);
  }, []);

  const handleDeleteFile = useCallback(
    async (id: string) => {
      await deleteFileById(id);
      setFiles(prev => prev.filter(f => f._id !== id));
      setFilesCount(prev => prev - 1);
      toast({ title: 'Storage', description: 'File deleted' });
    },
    [toast]
  );

  const removeFolderFromList = useCallback(
    async (id: string) => {
      await deleteFolder(id);
      setFolders(prev => prev.filter(f => f._id !== id));
      setFolderCount(prev => prev - 1);
      toast({ title: 'Storage', description: 'Folder deleted' });
    },
    [toast]
  );

  const addFileToList = useCallback((file: ConduitFile) => {
    setFiles(prev => [file, ...prev]);
    setFilesCount(prev => prev + 1);
  }, []);

  const addFolderToList = useCallback((folder: Folder) => {
    setFolders(prev => [folder, ...prev]);
    setFolderCount(prev => prev + 1);
  }, []);

  return (
    <StorageBrowseContext.Provider
      value={{
        containers,
        container,
        path,
        search,
        viewMode,
        folders,
        folderCount,
        files,
        filesCount,
        page,
        loading,
        setContainer,
        navigateTo,
        setSearch,
        setViewMode,
        setPage,
        refresh,
        refreshContainers,
        deleteFile: handleDeleteFile,
        removeFolderFromList,
        addFileToList,
        addFolderToList,
        itemsPerPage: ITEMS_PER_PAGE,
      }}
    >
      {children}
    </StorageBrowseContext.Provider>
  );
}
