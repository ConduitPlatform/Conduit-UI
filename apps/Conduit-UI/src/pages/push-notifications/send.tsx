import React, { ReactElement } from 'react';
import NotificationLayout from '../../components/navigation/InnerLayouts/notificationLayout';
import { NotificationData } from '../../models/notifications/NotificationModels';
import { asyncSendNewNotification } from '../../redux/slices/notificationsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendNotificationForm = dynamic(
  () => import('../../components/notifications/SendNotificationForm'),
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
