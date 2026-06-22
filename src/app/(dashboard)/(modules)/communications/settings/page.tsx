import { getEmailSettings } from '@/lib/api/email';
import { getSmsSettings } from '@/lib/api/sms';
import { getNotificationSettings } from '@/lib/api/notifications';
import { CommunicationsSettingsTabs } from '@/components/communications/settings/communications-settings-tabs';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';

type CommunicationsSettingsParams = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

function parseTab(tab: string | undefined): 'email' | 'sms' | 'push' {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

export default async function CommunicationsSettingsPage(
  props: Readonly<CommunicationsSettingsParams>
) {
  const searchParams = await props.searchParams;
  const tab = parseTab(searchParams.tab);

  const [
    { config: emailSettings },
    { config: smsSettings },
    { config: pushSettings },
  ] = await Promise.all([
    getEmailSettings(),
    getSmsSettings(),
    getNotificationSettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Configure email, SMS, and push providers.
          </PageDescription>
        </div>
      </PageHeader>

      <CommunicationsSettingsTabs
        initialTab={tab}
        emailSettings={emailSettings}
        smsSettings={smsSettings}
        pushSettings={pushSettings}
      />
    </div>
  );
}
