import { BreadCrumbs } from '@/components/storage/breadcrumbs';
import { getContainers } from '@/lib/api/storage';

export default async function StorageBrowse() {
  const refreshContainers = async () => {
    'use server';
    return await getContainers({
      skip: 0,
      limit: 100,
    });
  };
  return <BreadCrumbs refreshContainers={refreshContainers} />;
}
