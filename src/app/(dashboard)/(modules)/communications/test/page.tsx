import { getTokenById } from '@/lib/api/notifications';
import { CommunicationsTestTabs } from '@/components/communications/test/communications-test-tabs';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { isEmpty } from 'lodash';

type CommunicationsTestParams = {
  searchParams: Promise<{
    tab?: string;
    token?: string;
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

  const token = !isEmpty(searchParams.token)
    ? await getTokenById(searchParams.token ?? '', 'user')
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Test Send</PageTitle>
          <PageDescription>
            Send test messages across email, SMS, and push channels.
          </PageDescription>
        </div>
      </PageHeader>

      <CommunicationsTestTabs initialTab={tab} token={token} />
    </div>
  );
}
