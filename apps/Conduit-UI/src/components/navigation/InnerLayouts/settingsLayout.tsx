import React from 'react';
import { Settings } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/settings/clientsdk',
    '/settings/core',
    '/settings/admins',
    '/settings/password',
  ];
  const labels = [
    { name: 'clients SDK', id: 'clientsdk' },
    { name: 'core', id: 'core' },
    { name: 'admin section', id: 'admins' },
    { name: 'change password', id: 'password' },
  ];

  return (
    <StyledLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
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
