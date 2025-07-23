import { getRooms } from '@/lib/api/chat';
import Decimal from 'decimal.js';
import { ROOMS_LIMIT } from '@/components/chat/rooms/tables/rooms/utils';
import { RoomsDashboard } from '@/components/chat/rooms/dashboard';

type ChatRoomParams = {
  searchParams?: Promise<{
    pageIndex?: number;
    search?: string;
    sort?: string[];
    users?: string[];
    deleted?: string;
  }>;
};

export default async function ChatRooms(props: ChatRoomParams) {
  const searchParams = await props.searchParams;

  const skip = searchParams?.pageIndex
    ? new Decimal(searchParams?.pageIndex).mul(ROOMS_LIMIT).toNumber()
    : 0;

  const rooms = await getRooms({
    skip,
    limit: ROOMS_LIMIT,
    search: searchParams?.search,
    users: searchParams?.users,
    deleted:
      searchParams?.deleted === 'all'
        ? undefined
        : searchParams?.deleted === 'true',
    sort: searchParams?.sort,
  });
  return <RoomsDashboard data={rooms} />;
}
