import React from 'react';
import { Payment } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const PaymentsLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/payments/customers',
    '/payments/products',
    '/payments/transactions',
    '/payments/subscriptions',
    '/payments/logs',
    '/payments/config',
  ];

  const labels = [
    { name: 'customers', id: 'customers' },
    { name: 'products', id: 'products' },
    { name: 'transactions', id: 'transactions' },
    { name: 'subscriptions', id: 'subscriptions' },
    { name: 'logs', id: 'logs' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      title={'Payments'}
      labels={labels}
      pathNames={pathNames}
      swagger={'payments'}
      icon={<Payment />}>
      {children}
    </StyledLayout>
  );
};

export default PaymentsLayout;
