import React from 'react';
import { Settings } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = ['/settings/settings', '/settings/admins', '/settings/password'];
  const labels = [
    { name: 'settings', id: 'settings' },
    { name: 'admin users', id: 'admins' },
    { name: 'change password', id: 'password' },
  ];

  return (
    <StyledLayout title={'Settings'} labels={labels} pathNames={pathNames} icon={<Settings />}>
      {children}
    </StyledLayout>
  );
};

export default SettingsLayout;
