import React from 'react';
import SharedLayout from './sharedLayout';
import { Toc } from '@material-ui/icons';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = ['/database/schemas', '/database/custom', '/database/settings'];
  const labels = [
    { name: 'schemas', id: 'schemas' },
    { name: 'custom endpoints', id: 'custom' },
    { name: 'settings', id: 'settings' },
  ];

  return (
    <SharedLayout
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
