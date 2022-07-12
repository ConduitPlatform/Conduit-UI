import React, { ReactElement, useEffect } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import { asyncGetChatConfig } from '../../redux/slices/chatSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const ChatConfig = dynamic(() => import('../../components/chat/ChatConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetChatConfig());
  }, [dispatch]);

  return <ChatConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Config;
