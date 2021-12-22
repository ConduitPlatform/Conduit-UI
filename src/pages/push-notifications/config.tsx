import React, { ReactElement, useEffect } from 'react';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';
import NotificationConfig from '../../components/notifications/NotificationConfig';
import { asyncGetNotificationConfig } from '../../redux/slices/notificationsSlice';
import { useAppDispatch } from '../../redux/store';

const Settings = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetNotificationConfig());
  }, [dispatch]);

  return <NotificationConfig />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Settings;
