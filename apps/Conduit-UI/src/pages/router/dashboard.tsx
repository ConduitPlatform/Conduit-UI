import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import RouterLayout from '../../features/router/routerLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const RouterDashboard = dynamic(() => import('../../features/router/components/RouterDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <RouterDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Dashboard;
