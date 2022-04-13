import React from 'react';
import { SharedLayout } from 'ui-components';
import { Toc } from '@mui/icons-material';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = ['/database/schemas', '/database/custom', '/database/settings'];
  const labels = [
    { name: 'schemas', id: 'schemas' },
    { name: 'custom endpoints', id: 'custom' },
    { name: 'settings', id: 'settings' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Database'}
      labels={labels}
      pathNames={pathNames}
      swagger={'cms'}
      icon={<Toc />}>
      {children}
    </SharedLayout>
  );
};

export default DatabaseLayout;
