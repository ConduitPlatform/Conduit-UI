import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import FunctionsLayout from '../../features/functions/functionsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailDashboard = dynamic(
  () => import('../../features/functions/components/FunctionsDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <EmailDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <FunctionsLayout>{page}</FunctionsLayout>;
};

export default Dashboard;
