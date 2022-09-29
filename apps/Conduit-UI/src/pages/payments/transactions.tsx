import React, { ReactElement } from 'react';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsTransactions = dynamic(
  () => import('../../components/payments/PaymentsTransactions'),
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
