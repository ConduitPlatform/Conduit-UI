import { getEventRelays, getRouterSettings } from '@/lib/api/router';
import { EventRelayList } from '@/components/router/event-relays/event-relay-list';

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
  const [{ relays, count }, { config }] = await Promise.all([
    getEventRelays({
      skip,
      limit,
      search: searchParams.search,
    }),
    getRouterSettings(),
  ]);

  return (
    <div className="p-6">
      <EventRelayList
        relays={relays}
        count={count}
        socketsEnabled={config.transports.sockets}
      />
    </div>
  );
}
