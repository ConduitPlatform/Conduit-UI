import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import SMSLayout from '../../features/sms/smsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const SmsDashboard = dynamic(() => import('../../features/sms/SmsDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <SmsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Dashboard;
