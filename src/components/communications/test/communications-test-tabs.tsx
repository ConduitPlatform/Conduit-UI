'use client';

import { useRouter } from 'next/navigation';
import { SendEmailForm } from '@/components/email/send/form';
import { TestSendSmsForm } from '@/components/sms/smsTest/testSendSmsForm';
import { TestSendForm } from '@/components/notifications/testSend/testSendForm';
import { ChannelStatusCard } from '@/components/communications/test/channel-status-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettings, EmailTemplate } from '@/lib/models/email';
import { SmsSettings } from '@/lib/models/Sms';
import { NotificationSettings } from '@/lib/models/Notification';

const TEST_TABS = ['email', 'sms', 'push'] as const;
type TestTab = (typeof TEST_TABS)[number];

function parseTestTab(tab: string | undefined): TestTab {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

type CommunicationsTestTabsProps = {
  initialTab: TestTab;
  emailSettings: EmailSettings;
  smsSettings: SmsSettings;
  pushSettings: NotificationSettings;
  emailTemplates: {
    templateDocuments: EmailTemplate[];
    count: number;
  };
};

export function CommunicationsTestTabs({
  initialTab,
  emailSettings,
  smsSettings,
  pushSettings,
  emailTemplates,
}: CommunicationsTestTabsProps) {
  const router = useRouter();
  const activeTab = initialTab;

  const handleTabChange = (value: string) => {
    const tab = parseTestTab(value);
    router.replace(`/communications/test?tab=${tab}`, { scroll: false });
  };

  const statusProps = {
    emailSettings,
    smsSettings,
    pushSettings,
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="push">Push</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SendEmailForm templates={emailTemplates} />
          </div>
          <ChannelStatusCard channel="email" {...statusProps} />
        </div>
      </TabsContent>

      <TabsContent value="sms" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TestSendSmsForm embedded />
          </div>
          <ChannelStatusCard channel="sms" {...statusProps} />
        </div>
      </TabsContent>

      <TabsContent value="push" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TestSendForm embedded />
          </div>
          <ChannelStatusCard channel="push" {...statusProps} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
