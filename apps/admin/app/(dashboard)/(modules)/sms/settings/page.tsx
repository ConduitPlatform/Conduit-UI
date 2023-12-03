import { Settings } from '@/components/sms/settings';
import { getSmsSettings } from '@/lib/api/sms';

export default async function SmsSettings() {
  const { config: data } = await getSmsSettings()
  return (
    <Settings data={data} />
  );
}
