import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import DatabaseLayout from '../../features/database/databaseLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const DatabaseDashboard = dynamic(
  () => import('../../features/database/components/DatabaseDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <DatabaseDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Dashboard;
