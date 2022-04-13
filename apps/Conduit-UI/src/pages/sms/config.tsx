import React, { ReactElement, useEffect } from 'react';
import SMSLayout from '../../components/navigation/InnerLayouts/smsLayout';
import SmsConfig from '../../components/sms/SmsConfig';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSmsConfig } from '../../redux/slices/smsSlice';

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
