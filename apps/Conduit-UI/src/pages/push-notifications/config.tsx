import React, { ReactElement, useEffect } from 'react';
import NotificationLayout from '../../features/notifications/notificationLayout';
import { asyncGetNotificationConfig } from '../../features/notifications/notificationsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const NotificationConfig = dynamic(
  () => import('../../features/notifications/NotificationConfig'),
  {
    loading: () => <LoaderComponent />,
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
