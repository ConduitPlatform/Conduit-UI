import { Settings } from '@/components/router/settings';
import { getRouterSettings } from '@/lib/api/router';


export default async function RouterSettings() {
  const { config: data } = await getRouterSettings()
  return <Settings data={data} />
}
