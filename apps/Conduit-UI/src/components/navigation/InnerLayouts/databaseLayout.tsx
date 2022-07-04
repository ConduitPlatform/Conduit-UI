import React from 'react';
import { Toc } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/database/schemas',
    '/database/introspection',
    '/database/custom',
    '/database/settings',
  ];
  const labels = [
    { name: 'schemas', id: 'schemas' },
    { name: 'introspection', id: 'introspection' },
    { name: 'custom endpoints', id: 'custom' },
    { name: 'settings', id: 'settings' },
  ];

  return (
    <StyledLayout
      title={'Database'}
      labels={labels}
      pathNames={pathNames}
      swagger={'database'}
      graphQL={'database'}
      icon={<Toc />}>
      {children}
    </StyledLayout>
  );
};

export default DatabaseLayout;
