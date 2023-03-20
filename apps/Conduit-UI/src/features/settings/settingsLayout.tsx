import React from 'react';
import { Settings } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = ['/settings/settings', '/settings/admins', '/settings/userSettings'];
  const labels = [
    { name: 'General', id: 'settings' },
    { name: 'Admin Users', id: 'admins' },
    { name: 'User Settings', id: 'userSettings' },
  ];

  return (
    <StyledLayout
      module={'settings'}
      labels={labels}
      pathNames={pathNames}
      icon={<Settings />}
      configActive={true}>
      {children}
    </StyledLayout>
  );
};

export default SettingsLayout;
