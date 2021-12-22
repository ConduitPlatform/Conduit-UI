import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';
import PaymentsConfig from '../../components/payments/PaymentsConfig';
import { asyncGetPaymentSettings } from '../../redux/slices/paymentsSlice';

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetPaymentSettings());
  }, [dispatch]);

  return <PaymentsConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Config;
