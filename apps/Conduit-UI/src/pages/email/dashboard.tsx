import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';

const EmailDashboard = dynamic(() => import('../../components/emails/EmailDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <EmailDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Dashboard;
