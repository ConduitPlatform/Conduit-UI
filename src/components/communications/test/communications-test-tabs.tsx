'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SendEmailForm } from '@/components/email/send/form';
import { TestSendSmsForm } from '@/components/sms/smsTest/testSendSmsForm';
import { TestSendForm } from '@/components/notifications/testSend/testSendForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplate } from '@/lib/models/email';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';

const TEST_TABS = ['email', 'sms', 'push'] as const;
type TestTab = (typeof TEST_TABS)[number];

function parseTestTab(tab: string | undefined): TestTab {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

type EmailTemplates = {
  templateDocuments: EmailTemplate[];
  count: number;
};

type CommunicationsTestTabsProps = {
  initialTab: TestTab;
  templates: EmailTemplates;
  token?: NotificationToken;
};

export function CommunicationsTestTabs({
  initialTab,
  templates,
  token,
}: CommunicationsTestTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = initialTab;

  const handleTabChange = (value: string) => {
    const tab = parseTestTab(value);
    const params = new URLSearchParams();
    params.set('tab', tab);

    const tokenId = searchParams.get('token');
    if (tab === 'push' && tokenId) {
      params.set('token', tokenId);
    }

    router.replace(`/communications/test?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="push">Push</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-6">
        <SendEmailForm templates={templates} embedded />
      </TabsContent>

      <TabsContent value="sms" className="mt-6">
        <TestSendSmsForm embedded />
      </TabsContent>

      <TabsContent value="push" className="mt-6">
        <TestSendForm token={token} embedded />
      </TabsContent>
    </Tabs>
  );
}
