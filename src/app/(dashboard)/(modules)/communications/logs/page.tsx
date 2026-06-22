import { getTokens } from '@/lib/api/notifications';
import { CommunicationsLogsTabs } from '@/components/communications/logs/communications-logs-tabs';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';

type CommunicationsLogsParams = {
  searchParams: Promise<{
    tab?: string;
    messageId?: string;
    templateId?: string;
    receiver?: string;
    sender?: string;
    cc?: string;
    replyTo?: string;
    startDate?: string;
    endDate?: string;
    skip?: string;
    sort?: string;
    limit?: string;
    search?: string;
    platform?: string;
  }>;
};

function parseTab(tab: string | undefined): 'email' | 'push' {
  return tab === 'push' ? 'push' : 'email';
}

export default async function CommunicationsLogsPage(
  props: Readonly<CommunicationsLogsParams>
) {
  const searchParams = await props.searchParams;
  const tab = parseTab(searchParams.tab);

  const pushTokensData =
    tab === 'push'
      ? await getTokens(
          Number.parseInt(searchParams.skip ?? '0', 10) || 0,
          Number.parseInt(searchParams.limit ?? '20', 10) || 20,
          {
            sort: searchParams.sort,
            search: searchParams.search,
            platform: searchParams.platform,
          }
        )
      : undefined;

  const refreshPushTokens = async (search: string) => {
    'use server';
    const { tokens } = await getTokens(
      Number.parseInt(searchParams.skip ?? '0', 10) || 0,
      Number.parseInt(searchParams.limit ?? '20', 10) || 20,
      {
        sort: searchParams.sort,
        search,
        platform: searchParams.platform,
      }
    );
    return tokens;
  };

  return (
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Logs & Devices</PageTitle>
          <PageDescription>
            Email delivery history and registered push device tokens.
          </PageDescription>
        </div>
      </PageHeader>

      <CommunicationsLogsTabs
        initialTab={tab}
        pushTokensData={pushTokensData}
        refreshPushTokens={refreshPushTokens}
      />
    </div>
  );
}
