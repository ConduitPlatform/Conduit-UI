import React from 'react';
import { Payment } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';

const PaymentsLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/payments/dashboard',
    '/payments/customers',
    '/payments/products',
    '/payments/transactions',
    '/payments/subscriptions',
    '/payments/config',
  ];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'customers', id: 'customers' },
    { name: 'products', id: 'products' },
    { name: 'transactions', id: 'transactions' },
    { name: 'subscriptions', id: 'subscriptions' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      module={'payments'}
      labels={labels}
      pathNames={pathNames}
      swagger={'payments'}
      icon={<Payment />}>
      {children}
    </StyledLayout>
  );
};

export default PaymentsLayout;
