import { Settings } from '@/components/storage/settings';
import { getStorageSettings } from '@/lib/api/storage';
import { getAuthorizationSettings } from '@/lib/api/authorization';
import { getModules } from "@/lib/api/modules";

export default async function StorageSettings() {
  const { config: storageConfig } = await getStorageSettings();
  const modules = await getModules();
  const authzEnabled = !!modules.find(m => m.moduleName === 'authorization' && m.serving);
  const { config: authzConfig } = await getAuthorizationSettings();
  return (
    <Settings data={storageConfig} authzAvailable={authzEnabled} />
  );
}