'use client';

import { useRouter } from 'next/navigation';
import { Settings as EmailSettings } from '@/components/email/settings/settings';
import { Settings as SmsSettings } from '@/components/sms/settings';
import { Settings as PushSettings } from '@/components/notifications/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettings as EmailSettingsData } from '@/lib/models/email';
import { SmsSettings as SmsSettingsData } from '@/lib/models/Sms';
import { NotificationSettings } from '@/lib/models/Notification';

const SETTINGS_TABS = ['email', 'sms', 'push'] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

function parseSettingsTab(tab: string | undefined): SettingsTab {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

type CommunicationsSettingsTabsProps = {
  initialTab: SettingsTab;
  emailSettings: EmailSettingsData;
  smsSettings: SmsSettingsData;
  pushSettings: NotificationSettings;
};

export function CommunicationsSettingsTabs({
  initialTab,
  emailSettings,
  smsSettings,
  pushSettings,
}: CommunicationsSettingsTabsProps) {
  const router = useRouter();
  const activeTab = initialTab;

  const handleTabChange = (value: string) => {
    const tab = parseSettingsTab(value);
    router.replace(`/communications/settings?tab=${tab}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="push">Push</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-6">
        <EmailSettings data={emailSettings} embedded />
      </TabsContent>

      <TabsContent value="sms" className="mt-6">
        <SmsSettings data={smsSettings} embedded />
      </TabsContent>

      <TabsContent value="push" className="mt-6">
        <PushSettings data={pushSettings} embedded />
      </TabsContent>
    </Tabs>
  );
}
