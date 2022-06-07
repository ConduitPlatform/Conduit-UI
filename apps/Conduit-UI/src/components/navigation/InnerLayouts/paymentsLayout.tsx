import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Payment } from '@mui/icons-material';
import { CONDUIT_API } from '../../../http/requestsConfig';

const PaymentsLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/payments/customers',
    '/payments/products',
    '/payments/transactions',
    '/payments/subscriptions',
    '/payments/config',
  ];

  const labels = [
    { name: 'customers', id: 'customers' },
    { name: 'products', id: 'products' },
    { name: 'transactions', id: 'transactions' },
    { name: 'subscriptions', id: 'subscriptions' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
      title={'Payments'}
      labels={labels}
      pathNames={pathNames}
      swagger={'payments'}
      icon={<Payment />}>
      {children}
    </SharedLayout>
  );
};

export default PaymentsLayout;
