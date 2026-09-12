import { getEventRelays, getRouterSettings } from '@/lib/api/router';
import { EventRelayList } from '@/components/router/event-relays/event-relay-list';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Radio } from 'lucide-react';
import { isAxiosNotFoundError } from '@/lib/logic/api-error';

export default async function EventRelaysPage(props: {
  searchParams: Promise<{
    skip?: string;
    limit?: string;
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const skip = Number(searchParams.skip ?? 0);
  const limit = Number(searchParams.limit ?? 10);

  const [relaysResult, settingsResult] = await Promise.allSettled([
    getEventRelays({
      skip,
      limit,
      search: searchParams.search,
    }),
    getRouterSettings(),
  ]);

  if (
    relaysResult.status === 'rejected' &&
    isAxiosNotFoundError(relaysResult.reason)
  ) {
    return (
      <div className="p-6">
        <PageHeader>
          <div>
            <PageTitle>Event Relays</PageTitle>
            <PageDescription>
              Forward exact bus events to ReBAC-scoped socket subscribers.
            </PageDescription>
          </div>
        </PageHeader>
        <div className="mt-6">
          <EmptyState
            icon={Radio}
            title="Event Relays are not available"
            description="This Router does not expose /router/event-relays yet. Upgrade to a build that includes the event relays Admin API (Conduit PR #1600), then reload this page."
          />
        </div>
      </div>
    );
  }

  if (relaysResult.status === 'rejected') {
    throw relaysResult.reason;
  }

  const { relays, count } = relaysResult.value;
  const socketsEnabled =
    settingsResult.status === 'fulfilled'
      ? settingsResult.value.config.transports.sockets
      : undefined;

  return (
    <div className="p-6">
      <EventRelayList
        relays={relays}
        count={count}
        socketsEnabled={socketsEnabled}
      />
    </div>
  );
}
