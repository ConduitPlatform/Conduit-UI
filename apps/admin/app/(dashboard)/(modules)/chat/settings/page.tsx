import { Settings } from '@/components/chat/settings';
import { getChatSettings } from '@/lib/api/chat';
import { getModules } from '@/lib/api/modules';

export default async function ChatSettings() {
  const { config: data } = await getChatSettings();
  const modules = await getModules();
  const chatAvailable = !!modules.find(
    m => m.moduleName === 'chat' && m.serving
  );
  const emailAvailable = !!modules.find(
    m => m.moduleName === 'email' && m.serving
  );
  const pushNotificationsAvailable = !!modules.find(
    m => m.moduleName === 'pushNotifications' && m.serving
  );
  if (!chatAvailable) return <>Chat module is not serving.</>;
  return (
    <Settings
      data={data}
      emailAvailable={emailAvailable}
      pushNotificationsAvailable={pushNotificationsAvailable}
    />
  );
}
