import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';

const ChatDashboard = dynamic(() => import('../../components/chat/ChatDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <ChatDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Dashboard;
