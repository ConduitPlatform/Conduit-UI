import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import { asyncGetPaymentConfig } from '../../redux/slices/paymentsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsConfig = dynamic(() => import('../../components/payments/PaymentsConfig'), {
  loading: () => <LoaderComponent />,
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetPaymentConfig());
  }, [dispatch]);

  return <PaymentsConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Config;
