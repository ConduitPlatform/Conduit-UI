import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';

const EmailLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <EmailLogs moduleName={'email'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Logs;
