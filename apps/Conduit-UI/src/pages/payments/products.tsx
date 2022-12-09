import React, { ReactElement } from 'react';
import PaymentsLayout from '../../features/payments/paymentsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsProducts = dynamic(
  () => import('../../features/payments/components/PaymentsProducts'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Products = () => {
  return <PaymentsProducts />;
};

Products.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Products;
