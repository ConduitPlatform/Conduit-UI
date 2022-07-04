import React from 'react';
import { Cloud } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const StorageLayout: React.FC = ({ children }) => {
  const pathNames = ['/storage/files', '/storage/config'];

  const labels = [
    { name: 'files', id: 'files' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      title={'Storage'}
      labels={labels}
      pathNames={pathNames}
      swagger={'storage'}
      graphQL={'storage'}
      icon={<Cloud />}>
      {children}
    </StyledLayout>
  );
};

export default StorageLayout;
