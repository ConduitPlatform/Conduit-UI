import { getFolders } from '@/lib/api/storage';
import { getModules } from '@/lib/api/modules';
import { CarouselView } from '@/components/storage/units/folder/carousel-view';
import { NoContainerLayout } from '@/app/(dashboard)/(modules)/storage/browse/noContainer';
import { SearchInput } from '@/components/storage/search';

type FolderSlotParams = {
  searchParams?: {
    container?: string; // TODO: this should be layout global
    folderName?: string;
  };
};

export default async function FoldersSlot({ searchParams }: FolderSlotParams) {
  const modules = await getModules();
  const authzAvailable = !!modules.find(
    m => m.moduleName === 'authorization' && m.serving
  );

  const refreshFolders = async (path: string, container: string) => {
    'use server';
    return await getFolders({
      skip: 0,
      limit: 7,
      sort: '-createdAt',
      parent: path,
      container: container,
      search: searchParams?.folderName,
    });
  };

  return (
    <>
      <div className="space-y-4 row-span-1">
        <div className="flex justify-between">
          <h1 className="font-semibold text-3xl">Folders</h1>
          <div className="flex gap-x-5 items-center">
            <SearchInput
              field="folderName"
              active={!!searchParams?.container}
            />
          </div>
        </div>
        {searchParams?.container ? (
          <div className="flex gap-x-4">
            <CarouselView refreshFolders={refreshFolders} />
          </div>
        ) : (
          <NoContainerLayout />
        )}
      </div>
    </>
  );
}
