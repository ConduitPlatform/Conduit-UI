import { getEmailSettings, getTemplates } from '@/lib/api/email';
import { getSmsSettings } from '@/lib/api/sms';
import { getNotificationSettings } from '@/lib/api/notifications';
import { CommunicationsTestTabs } from '@/components/communications/test/communications-test-tabs';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';

type CommunicationsTestParams = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

function parseTab(tab: string | undefined): 'email' | 'sms' | 'push' {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

export default async function CommunicationsTestPage(
  props: Readonly<CommunicationsTestParams>
) {
  const searchParams = await props.searchParams;
  const tab = parseTab(searchParams.tab);

  const [
    { config: emailSettings },
    { config: smsSettings },
    { config: pushSettings },
    emailTemplates,
  ] = await Promise.all([
    getEmailSettings(),
    getSmsSettings(),
    getNotificationSettings(),
    getTemplates({}),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Test Send</PageTitle>
          <PageDescription>
            Send test messages to verify provider configuration.
          </PageDescription>
        </div>
      </PageHeader>

      <CommunicationsTestTabs
        initialTab={tab}
        emailSettings={emailSettings}
        smsSettings={smsSettings}
        pushSettings={pushSettings}
        emailTemplates={emailTemplates}
      />
    </div>
  );
}
