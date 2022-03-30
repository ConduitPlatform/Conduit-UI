import React from 'react';
import SharedLayout from './sharedLayout';
import { Payment } from '@mui/icons-material';

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
