import { getModules } from '@/lib/api/modules';
import { getRooms } from '@/lib/api/chat';
import Decimal from 'decimal.js';
import { ROOMS_LIMIT } from '@/components/chat/rooms/tables/rooms/utils';
import { RoomsDashboard } from '@/components/chat/rooms/dashboard';

type ChatRoomParams = {
  searchParams?: {
    pageIndex?: number;
    search?: string;
    sort?: string;
    desc?: string;
    users?: string[];
    deleted?: 'true' | 'false' | 'all';
  };
};

export default async function ChatRooms({ searchParams }: ChatRoomParams) {
  const modules = await getModules();
  const chatModuleAvailable = !!modules.find(
    m => m.moduleName === 'chat' && m.serving
  );
  if (!chatModuleAvailable) return <>Chat module is not serving.</>;

  const skip = searchParams?.pageIndex
    ? new Decimal(searchParams?.pageIndex).mul(ROOMS_LIMIT).toNumber()
    : 0;
  const sort = searchParams?.sort
    ? `${searchParams.desc === 'true' ? '-' : ''}${searchParams.sort}`
    : searchParams?.sort;

  const rooms = await getRooms({
    skip,
    limit: ROOMS_LIMIT,
    search: searchParams?.search,
    users: searchParams?.users,
    deleted:
      searchParams?.deleted === 'all'
        ? undefined
        : searchParams?.deleted === 'true',
    sort,
  });
  return <RoomsDashboard data={rooms} />;
}
