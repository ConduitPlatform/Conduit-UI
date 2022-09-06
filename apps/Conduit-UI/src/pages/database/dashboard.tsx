import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';

const DatabaseDashboard = dynamic(() => import('../../components/database/DatabaseDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <DatabaseDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Dashboard;
