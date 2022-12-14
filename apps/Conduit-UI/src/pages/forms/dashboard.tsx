import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import FormsLayout from '../../features/forms/formsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const FormsDashboard = dynamic(() => import('../../features/forms/components/FormsDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <FormsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Dashboard;
