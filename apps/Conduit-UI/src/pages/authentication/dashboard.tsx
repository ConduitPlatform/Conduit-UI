import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';

const AuthenticationDashboard = dynamic(
  () => import('../../components/authentication/AuthenticationDashboard'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Dashboard = () => {
  return <AuthenticationDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Dashboard;
