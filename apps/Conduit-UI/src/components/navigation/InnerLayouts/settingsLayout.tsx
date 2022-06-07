import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Settings } from '@mui/icons-material';
import { CONDUIT_API } from '../../../http/requestsConfig';

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
      baseUrl={CONDUIT_API}
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
