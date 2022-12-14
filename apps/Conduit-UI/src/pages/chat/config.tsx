import React, { ReactElement, useEffect } from 'react';
import ChatLayout from '../../features/chat/chatLayout';
import { asyncGetChatConfig } from '../../features/chat/store/chatSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const ChatConfig = dynamic(() => import('../../features/chat/components/ChatConfig'), {
  loading: () => <LoaderComponent />,
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
