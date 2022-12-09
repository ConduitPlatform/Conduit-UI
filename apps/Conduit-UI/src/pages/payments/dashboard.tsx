import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import PaymentsLayout from '../../features/payments/paymentsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsDashboard = dynamic(() => import('../../features/payments/PaymentsDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <PaymentsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Dashboard;
