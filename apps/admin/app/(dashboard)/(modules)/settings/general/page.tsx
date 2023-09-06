import { General } from '@/components/settings/general';
import { getAdminSettings, getCoreSettings } from '@/lib/api/settings';


export default async function SettingsGeneral() {
  const {config: coreData} = await getCoreSettings();
  const {config: adminData} = await getAdminSettings()
  return <General data={{...coreData,...adminData}} />
}