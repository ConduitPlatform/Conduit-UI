import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';

const NotificationsLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <NotificationsLogs moduleName={'pushNotifications'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Logs;
