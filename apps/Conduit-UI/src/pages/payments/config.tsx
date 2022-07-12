import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import { asyncGetPaymentConfig } from '../../redux/slices/paymentsSlice';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const PaymentsConfig = dynamic(() => import('../../components/payments/PaymentsConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
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
