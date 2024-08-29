import { Settings } from '@/components/storage/settings/settings';
import { getStorageSettings } from '@/lib/api/storage';
import { getModules } from '@/lib/api/modules';

export default async function StorageSettings() {
  const { config: storageConfig } = await getStorageSettings();
  const modules = await getModules();
  const authzAvailable = !!modules.find(
    m => m.moduleName === 'authorization' && m.serving
  );
  return <Settings data={storageConfig} authzAvailable={authzAvailable} />;
}
