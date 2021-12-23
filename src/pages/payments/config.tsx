import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import PaymentsConfig from '../../components/payments/PaymentsConfig';
import { asyncGetPaymentConfig } from '../../redux/slices/paymentsSlice';

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
