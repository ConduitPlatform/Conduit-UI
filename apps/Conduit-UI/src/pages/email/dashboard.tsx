import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailDashboard = dynamic(() => import('../../components/emails/EmailDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <EmailDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Dashboard;
