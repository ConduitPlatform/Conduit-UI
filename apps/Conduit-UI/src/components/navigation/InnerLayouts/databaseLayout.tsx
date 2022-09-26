import React from 'react';
import { Toc } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/database/dashboard',
    '/database/schemas',
    '/database/introspection',
    '/database/custom',
    '/database/settings',
  ];
  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'schemas', id: 'schemas' },
    { name: 'introspection', id: 'introspection' },
    { name: 'custom endpoints', id: 'custom' },
    { name: 'settings', id: 'settings' },
  ];

  return (
    <StyledLayout
      configActive={true}
      module={'database'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/database/'}
      pathNames={pathNames}
      swagger={'cms'}
      icon={<Toc />}>
      {children}
    </StyledLayout>
  );
};

export default DatabaseLayout;
