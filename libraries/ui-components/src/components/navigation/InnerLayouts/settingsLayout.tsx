import React from 'react';
import SharedLayout from './sharedLayout';
import { Settings } from '@mui/icons-material';

const SettingsLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/settings/clientsdk',
    '/settings/secrets',
    '/settings/core',
    '/settings/createuser',
  ];
  const labels = [
    { name: 'clients SDK', id: 'clientsdk' },
    { name: 'secrets', id: 'secrets' },
    { name: 'core', id: 'core' },
    { name: 'create User', id: 'createuser' },
  ];

  return (
    <SharedLayout
      title={'Settings'}
      labels={labels}
      pathNames={pathNames}
      swagger={'settings'}
      icon={<Settings />}>
      {children}
    </SharedLayout>
  );
};

export default SettingsLayout;
