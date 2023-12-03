import { Settings } from '@/components/functions/settings';
import { getFunctionsSettings } from '@/lib/api/functions';

export default async function FunctionsSettings() {
  const { config: data } = await getFunctionsSettings()
  return (
    <Settings data={data} />
  );
}
