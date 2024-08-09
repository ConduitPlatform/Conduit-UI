import { BreadCrumbs } from '@/components/storage/breadcrumbs';
import { getContainers } from '@/lib/api/storage';

export default async function StorageBrowse() {
  const containers = await getContainers({
    skip: 0,
    limit: 10,
  });
  return <BreadCrumbs containers={containers.containers} />;
}
