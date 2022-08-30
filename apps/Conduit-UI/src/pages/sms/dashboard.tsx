import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import SMSLayout from '../../components/navigation/InnerLayouts/smsLayout';

const SmsDashboard = dynamic(() => import('../../components/sms/SmsDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <SmsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Dashboard;
