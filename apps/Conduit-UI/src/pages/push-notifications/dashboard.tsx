import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const NotificationDashboard = dynamic(
  () => import('../../components/notifications/NotificationDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <NotificationDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Dashboard;
