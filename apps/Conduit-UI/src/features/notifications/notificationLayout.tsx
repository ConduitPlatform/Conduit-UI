import React from 'react';
import { Notifications } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const NotificationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.notificationsSlice.data.config.active);
  const pathNames = [
    '/push-notifications/dashboard',
    '/push-notifications/send',
    '/push-notifications/config',
  ];

  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Send', id: 'send' },
    { name: 'Config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'pushNotifications'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/push-notifications/'}
      pathNames={pathNames}
      swagger={'pushNotifications'}
      icon={<Notifications />}>
      {children}
    </StyledLayout>
  );
};

export default NotificationLayout;
