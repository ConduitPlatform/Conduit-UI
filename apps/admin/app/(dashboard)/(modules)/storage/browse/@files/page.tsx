import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryHorizontal, List } from 'lucide-react';
import { getModules } from '@/lib/api/modules';
import { getFiles } from '@/lib/api/storage';
import { FileListView } from '@/components/storage/units/file/file-list-view';
import { CreateFileForm } from '@/components/storage/units/file/forms/createForm';
import { NoContainerLayout } from '@/app/(dashboard)/(modules)/storage/browse/noContainer';

type FileSlotParams = {
  searchParams?: {
    container?: string; // TODO: this should be layout global
    sfl?: number;
    sll?: number;
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
      skip: 0,
      limit: 10,
      container: container,
      folder: path.replace(/^\/|\/$/g, ''),
    });
  };

  return (
    <div className="space-y-4 row-span-2">
      <div className="flex justify-between">
        <h1 className="font-semibold text-3xl">Files</h1>
        <div className="flex gap-x-5 items-center">
          <div>search</div>
        </div>
      </div>
      {searchParams?.container ? (
        <>
          <CreateFileForm />
          <Tabs defaultValue="list" className="w-full h-full space-y-5">
            <TabsList className="">
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
              Files Gallery View
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <NoContainerLayout />
      )}
    </div>
  );
}
