import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryHorizontal, List } from 'lucide-react';
import { getModules } from '@/lib/api/modules';

type FileSlotParams = {
  searchParams: {
    sfl?: number;
    sll?: number;
  };
};

export default async function FilesSlot({ searchParams }: FileSlotParams) {
  const modules = await getModules();
  const authzAvailable = !!modules.find(
    m => m.moduleName === 'authorization' && m.serving
  );
  return (
    <div className="space-y-4 row-span-2">
      <div className="flex justify-between">
        <h1 className="font-semibold text-3xl">Files</h1>
        <div className="flex gap-x-5 items-center">
          <div>search</div>
        </div>
      </div>
      <Tabs
        defaultValue="list"
        className="w-full h-full space-y-5 bg-neutral-400"
      >
        <TabsList className="">
          <TabsTrigger value="list">
            <List width={16} height={16} />
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <GalleryHorizontal width={16} height={16} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">Files List View.</TabsContent>
        <TabsContent value="gallery" className="overflow-auto h-full">
          Files Gallery View
        </TabsContent>
      </Tabs>
    </div>
  );
}
