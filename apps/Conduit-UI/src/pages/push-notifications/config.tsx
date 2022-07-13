import React, { ReactElement, useEffect } from 'react';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';
import { asyncGetNotificationConfig } from '../../redux/slices/notificationsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const NotificationConfig = dynamic(
  () => import('../../components/notifications/NotificationConfig'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetNotificationConfig());
  }, [dispatch]);

  return <NotificationConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Config;
