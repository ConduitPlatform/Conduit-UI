import React, { ReactElement, useEffect } from 'react';
import SMSLayout from '../../features/sms/smsLayout';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSmsConfig } from '../../features/sms/store/smsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SmsConfig = dynamic(() => import('../../features/sms/components/SmsConfig'), {
  loading: () => <LoaderComponent />,
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
