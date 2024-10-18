import { Settings } from '@/components/email/settings/settings';
import { getEmailSettings } from '@/lib/api/email';

export default async function EmailSettings() {
  const { config: data } = await getEmailSettings();
  return <Settings data={data} />;
}
