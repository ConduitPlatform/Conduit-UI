import React from 'react';
import { Notifications } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const NotificationLayout: React.FC = ({ children }) => {
  const pathNames = ['/push-notifications/send', '/push-notifications/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      title={'Push Notifications'}
      labels={labels}
      pathNames={pathNames}
      swagger={'pushNotifications'}
      graphQL={'pushNotifications'}
      icon={<Notifications />}>
      {children}
    </StyledLayout>
  );
};

export default NotificationLayout;
