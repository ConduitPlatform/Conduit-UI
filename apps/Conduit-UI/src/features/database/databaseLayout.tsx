import React from 'react';
import { Toc } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';

const DatabaseLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/database/dashboard',
    '/database/schemas',
    '/database/introspection',
    '/database/custom',
  ];
  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Models', id: 'schemas' },
    { name: 'Introspection', id: 'introspection' },
    { name: 'Custom Endpoints', id: 'custom' },
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
