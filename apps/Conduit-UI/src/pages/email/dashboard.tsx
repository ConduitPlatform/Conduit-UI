import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import EmailsLayout from '../../features/emails/emailsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailDashboard = dynamic(() => import('../../features/emails/components/EmailDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <EmailDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Dashboard;
