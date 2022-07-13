import React, { ReactElement } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const ChatRooms = dynamic(() => import('../../components/chat/ChatRooms'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Rooms = () => {
  return <ChatRooms />;
};

Rooms.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Rooms;
