import { getApiTokens } from '@/lib/api/api-tokens';
import { ApiTokensPage } from '@/components/settings/api-tokens/ApiTokensPage';

export default async function SettingsApiTokens() {
  const { tokens } = await getApiTokens();

  return <ApiTokensPage initialTokens={tokens} />;
}
