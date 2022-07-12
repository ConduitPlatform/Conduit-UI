import React, { ReactElement, useEffect } from 'react';
import SMSLayout from '../../components/navigation/InnerLayouts/smsLayout';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSmsConfig } from '../../redux/slices/smsSlice';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const SmsConfig = dynamic(() => import('../../components/sms/SmsConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSmsConfig());
  }, [dispatch]);

  return <SmsConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Config;
