import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import SmsLayout from '../../components/navigation/InnerLayouts/smsLayout';

const SmsLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <SmsLogs moduleName={'sms'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <SmsLayout>{page}</SmsLayout>;
};

export default Logs;
