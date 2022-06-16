import React from 'react';
import { Settings } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = ['/settings/core', '/settings/admins', '/settings/password'];
  const labels = [
    { name: 'core', id: 'core' },
    { name: 'admin users', id: 'admins' },
    { name: 'change password', id: 'password' },
  ];

  return (
    <StyledLayout
      title={'Settings'}
      labels={labels}
      pathNames={pathNames}
      swagger={'settings'}
      icon={<Settings />}>
      {children}
    </StyledLayout>
  );
};

export default SettingsLayout;
