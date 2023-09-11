import { Settings } from '@/components/forms/settings';
import { getFormsSettings } from '@/lib/api/forms';

export default async function RouterSettings() {
  const { config: data } = await getFormsSettings()
  return <Settings data={data} />
}