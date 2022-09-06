import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';

const PaymentsDashboard = dynamic(() => import('../../components/payments/PaymentsDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <PaymentsDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Dashboard;
