import React from 'react';
import { Notifications } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const NotificationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.notificationsSlice.data.config.active);
  const pathNames = ['/push-notifications/send', '/push-notifications/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'pushNotifications'}
      labels={labels}
      pathNames={pathNames}
      swagger={'pushNotifications'}
      icon={<Notifications />}>
      {children}
    </StyledLayout>
  );
};

export default NotificationLayout;
