import React from 'react';
import { Settings } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = ['/settings/settings', '/settings/admins', '/settings/password'];
  const labels = [
    { name: 'general', id: 'settings' },
    { name: 'admin users', id: 'admins' },
    { name: 'change password', id: 'password' },
  ];

  return (
    <StyledLayout
      title={'Settings'}
      labels={labels}
      pathNames={pathNames}
      icon={<Settings />}
      configActive={true}>
      {children}
    </StyledLayout>
  );
};

export default SettingsLayout;
