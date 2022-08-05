import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import PaymentsLayout from '../../components/navigation/InnerLayouts/paymentsLayout';

const PaymentsLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <PaymentsLogs moduleName={'payments'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Logs;
