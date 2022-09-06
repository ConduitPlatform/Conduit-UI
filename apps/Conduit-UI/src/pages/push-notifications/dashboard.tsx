import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';

const NotificationDashboard = dynamic(
  () => import('../../components/notifications/NotificationDashboard'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Dashboard = () => {
  return <NotificationDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Dashboard;
