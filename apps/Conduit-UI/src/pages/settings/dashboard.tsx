import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';

const SettingsDashboard = dynamic(
  () => import('../../components/notifications/NotificationDashboard'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Dashboard = () => {
  return <SettingsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Dashboard;
