import React, { ReactElement } from 'react';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const PaymentsTransactions = dynamic(
  () => import('../../components/payments/PaymentsTransactions'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Transactions = () => {
  return <PaymentsTransactions />;
};
Transactions.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Transactions;
