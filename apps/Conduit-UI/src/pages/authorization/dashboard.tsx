import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import LoaderComponent from '../../components/common/LoaderComponent';
import AuthorizationLayout from '../../features/authorization/authorizationLayout';

const AuthorizationDashboard = dynamic(
  () => import('../../features/authorization/components/AuthorizationDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <AuthorizationDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <AuthorizationLayout>{page}</AuthorizationLayout>;
};

export default Dashboard;
