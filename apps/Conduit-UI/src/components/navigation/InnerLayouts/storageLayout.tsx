import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Cloud } from '@mui/icons-material';
import { CONDUIT_API } from '../../../http/requestsConfig';

const StorageLayout: React.FC = ({ children }) => {
  const pathNames = ['/storage/files', '/storage/config'];

  const labels = [
    { name: 'files', id: 'files' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
      title={'Storage'}
      labels={labels}
      pathNames={pathNames}
      swagger={'storage'}
      icon={<Cloud />}>
      {children}
    </SharedLayout>
  );
};

export default StorageLayout;
