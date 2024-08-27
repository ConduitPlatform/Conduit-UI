import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryHorizontal, List } from 'lucide-react';
import { getModules } from '@/lib/api/modules';
import { getFiles } from '@/lib/api/storage';
import { FileListView } from '@/components/storage/units/file/file-list-view';
import { NoContainerLayout } from '@/app/(dashboard)/(modules)/storage/browse/noContainer';
import { Header } from '@/components/storage/units/file/files-header';
import { FilesGalleryView } from '@/components/storage/units/file/file-gallery-view';
import { FILES_LIMIT } from '@/components/storage/units/file/utils';

type FileSlotParams = {
  searchParams?: {
    container?: string; // TODO: this should be layout global
    skip?: number;
    fileName?: string;
  };
};

export default async function FilesSlot({ searchParams }: FileSlotParams) {
  const modules = await getModules();
  const authzAvailable = !!modules.find(
    m => m.moduleName === 'authorization' && m.serving
  );

  // TODO: check if container exists
  const refreshFiles = async (path: string, container: string) => {
    'use server';
    return await getFiles({
      skip: searchParams?.skip ?? 0,
      limit: FILES_LIMIT,
      container: container,
      folder: path.replace(/^\/|\/$/g, ''),
      search: searchParams?.fileName,
    });
  };

  return (
    <div className="space-y-4 row-span-2">
      <div className="w-full flex flex-col justify-between">
        <Header />
        {searchParams?.container ? (
          <Tabs defaultValue="list" className="mt-4 w-full h-full space-y-5">
            <TabsList>
              <TabsTrigger value="list">
                <List width={16} height={16} />
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <GalleryHorizontal width={16} height={16} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <FileListView refreshFiles={refreshFiles} />
            </TabsContent>
            <TabsContent value="gallery" className="overflow-auto h-full">
              <FilesGalleryView refreshFiles={refreshFiles} />
            </TabsContent>
          </Tabs>
        ) : (
          <NoContainerLayout />
        )}
      </div>
    </div>
  );
}
