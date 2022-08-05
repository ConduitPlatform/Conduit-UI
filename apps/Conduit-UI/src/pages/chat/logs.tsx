import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';

const ChatLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <ChatLogs moduleName={'chat'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Logs;
