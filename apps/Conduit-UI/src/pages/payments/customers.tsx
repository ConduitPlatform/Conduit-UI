import React, { ReactElement } from 'react';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const PaymentsCustomers = dynamic(() => import('../../components/payments/PaymentsCustomers'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Customers = () => {
  return <PaymentsCustomers />;
};

Customers.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Customers;
