import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const SettingsDashboard = dynamic(
  () => import('../../components/notifications/NotificationDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <SettingsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Dashboard;
