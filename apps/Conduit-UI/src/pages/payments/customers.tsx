import React, { ReactElement } from 'react';
import PaymentsLayout from '../../features/payments/paymentsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsCustomers = dynamic(
  () => import('../../features/payments/components/PaymentsCustomers'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Customers = () => {
  return <PaymentsCustomers />;
};

Customers.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Customers;
