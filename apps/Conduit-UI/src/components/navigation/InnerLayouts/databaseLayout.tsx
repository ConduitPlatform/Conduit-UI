import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Toc } from '@mui/icons-material';
import { CONDUIT_API } from '../../../http/requestsConfig';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = ['/database/schemas', '/database/custom', '/database/settings'];
  const labels = [
    { name: 'schemas', id: 'schemas' },
    { name: 'custom endpoints', id: 'custom' },
    { name: 'settings', id: 'settings' },
  ];

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
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
