import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import AuthenticationLayout from '../../features/authentication/authenticationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationDashboard = dynamic(
  () => import('../../features/authentication/components/AuthenticationDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <AuthenticationDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Dashboard;
