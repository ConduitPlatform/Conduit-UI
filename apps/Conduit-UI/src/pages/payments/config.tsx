import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import PaymentsLayout from '../../features/payments/paymentsLayout';
import { asyncGetPaymentConfig } from '../../features/payments/store/paymentsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const PaymentsConfig = dynamic(() => import('../../features/payments/components/PaymentsConfig'), {
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
