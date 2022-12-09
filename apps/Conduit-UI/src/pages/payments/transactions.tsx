import React, { ReactElement } from 'react';
import PaymentsLayout from '../../features/payments/paymentsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsTransactions = dynamic(
  () => import('../../features/payments/components/PaymentsTransactions'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Transactions = () => {
  return <PaymentsTransactions />;
};
Transactions.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Transactions;
