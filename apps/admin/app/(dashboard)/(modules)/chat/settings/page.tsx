import { Settings } from '@/components/chat/settings';
import { getChatSettings } from '@/lib/api/chat';

export default async function ChatSettings() {
  const { config: data } = await getChatSettings()
  return (
    <Settings data={data} />
  );
}
