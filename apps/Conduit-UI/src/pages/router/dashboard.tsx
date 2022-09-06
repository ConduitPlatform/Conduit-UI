import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';

const RouterDashboard = dynamic(() => import('../../components/routing/RouterDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <RouterDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Dashboard;
