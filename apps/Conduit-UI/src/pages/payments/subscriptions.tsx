import React, { ReactElement } from 'react';
import PaymentsLayout from '../../features/payments/paymentsLayout';

import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsSubscriptions = dynamic(
  () => import('../../features/payments/components/PaymentsSubscriptions'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Subscriptions = () => {
  return <PaymentsSubscriptions />;
};
Subscriptions.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Subscriptions;
