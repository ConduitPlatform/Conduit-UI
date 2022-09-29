import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const DatabaseDashboard = dynamic(() => import('../../components/database/DatabaseDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <DatabaseDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Dashboard;
