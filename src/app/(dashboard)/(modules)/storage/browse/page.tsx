import { getContainers } from '@/lib/api/storage';
import { StorageBrowseProvider } from '@/components/storage/browse/StorageBrowseProvider';
import { StorageBrowser } from '@/components/storage/browse/StorageBrowser';

export default async function StorageBrowse() {
  const { containers } = await getContainers({ skip: 0, limit: 100 });

  return (
    <StorageBrowseProvider initialContainers={containers}>
      <StorageBrowser />
    </StorageBrowseProvider>
  );
}
