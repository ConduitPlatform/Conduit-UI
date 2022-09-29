import React, { ReactElement, useEffect } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import { asyncGetChatConfig } from '../../redux/slices/chatSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const ChatConfig = dynamic(() => import('../../components/chat/ChatConfig'), {
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
