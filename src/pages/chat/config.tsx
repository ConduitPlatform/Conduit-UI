import React, { ReactElement, useEffect } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import ChatConfig from '../../components/chat/ChatConfig';
import { asyncGetChatConfig } from '../../redux/slices/chatSlice';
import { useAppDispatch } from '../../redux/store';

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
