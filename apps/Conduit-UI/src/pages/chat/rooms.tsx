import React, { ReactElement } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const ChatRooms = dynamic(() => import('../../components/chat/ChatRooms'), {
  loading: () => <LoaderComponent />,
});

const Rooms = () => {
  return <ChatRooms />;
};

Rooms.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Rooms;
