import React from 'react';
import { Cloud } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const StorageLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.storageSlice.data.config.active);
  const pathNames = ['/storage/files', '/storage/logs', '/storage/config'];

  const labels = [
    { name: 'files', id: 'files' },
    { name: 'logs', id: 'logs' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      title={'Storage'}
      labels={labels}
      pathNames={pathNames}
      swagger={'storage'}
      icon={<Cloud />}>
      {children}
    </StyledLayout>
  );
};

export default StorageLayout;
