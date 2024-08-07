import { Settings } from '@/components/notifications/settings';
import { getNotificationSettings } from '@/lib/api/notifications';

export default async function NotificationSettings() {
  const { config: data } = await getNotificationSettings();
  return <Settings data={data} />;
}
