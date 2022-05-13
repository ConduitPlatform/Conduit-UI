import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Security } from '@mui/icons-material';

const SecurityLayout: React.FC = ({ children }) => {
  const pathNames = ['/security/clients', '/security/config'];

  const labels = [
    { name: 'clients', id: 'clients' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Security'}
      labels={labels}
      pathNames={pathNames}
      swagger={'security'}
      icon={<Security />}>
      {children}
    </SharedLayout>
  );
};

export default SecurityLayout;
