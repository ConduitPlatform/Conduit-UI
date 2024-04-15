import { getAuthenticationSettings } from '@/lib/api/authentication';
import { AuthenticationSettings } from '@/components/authentication/strategies/settings';

export default async function AuthenticationSettingsPage() {
  const { config: data } = await getAuthenticationSettings();
  return <AuthenticationSettings data={data} />;
}
