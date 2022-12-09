import React, { ReactElement } from 'react';
import NotificationLayout from '../../features/notifications/notificationLayout';
import { NotificationData } from '../../features/notifications/models/NotificationModels';
import { asyncSendNewNotification } from '../../features/notifications/store/notificationsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendNotificationForm = dynamic(
  () => import('../../features/notifications/components/SendNotificationForm'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Send = () => {
  const dispatch = useAppDispatch();

  const sendNotification = (data: NotificationData) => {
    dispatch(asyncSendNewNotification(data));
  };

  return <SendNotificationForm handleSend={sendNotification} />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <NotificationLayout>{page}</NotificationLayout>;
};

export default Send;
