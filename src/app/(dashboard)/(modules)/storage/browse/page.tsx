import { BreadCrumbs } from '@/components/storage/breadcrumbs';
import { getContainers, getFiles, getFolders } from '@/lib/api/storage';
import { GlobalSearch } from '@/components/storage/command';

export default async function StorageBrowse() {
  const refreshContainers = async () => {
    'use server';
    return await getContainers({
      skip: 0,
      limit: 100,
    });
  };

  const refreshItems = async (container: string, name?: string) => {
    'use server';
    const files = await getFiles({
      skip: 0,
      limit: 4,
      container: container,
      search: name,
    });
    const folders = await getFolders({
      skip: 0,
      limit: 4,
      container: container,
      search: name,
    });
    return {
      files,
      folders,
    };
  };

  return (
    <>
      <BreadCrumbs refreshContainers={refreshContainers} />
      <GlobalSearch refreshItems={refreshItems} />
    </>
  );
}
