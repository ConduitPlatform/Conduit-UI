import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ChatLayout from '../../components/navigation/InnerLayouts/chatLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const ChatDashboard = dynamic(() => import('../../components/chat/ChatDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <ChatDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>;
};

export default Dashboard;
