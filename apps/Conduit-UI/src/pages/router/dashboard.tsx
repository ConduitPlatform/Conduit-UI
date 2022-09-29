import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const RouterDashboard = dynamic(() => import('../../components/routing/RouterDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <RouterDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Dashboard;
