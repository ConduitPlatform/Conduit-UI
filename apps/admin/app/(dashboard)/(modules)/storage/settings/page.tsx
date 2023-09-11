import { Settings } from '@/components/storage/settings';
import { getStorageSettings } from '@/lib/api/storage';

export default async function StorageSettings() {
  const { config: data } = await getStorageSettings()
  return (
    <Settings data={data} />
  );
}