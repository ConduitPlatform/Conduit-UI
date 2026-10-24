import { Settings } from '@/components/authorization/settings';
import { getAuthorizationSettings } from '@/lib/api/authorization';

export default async function AuthorizationSettings() {
  const { config: data } = await getAuthorizationSettings();
  return <Settings data={data} />;
}
