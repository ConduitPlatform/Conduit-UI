import React from 'react';
import { Cloud } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const StorageLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.storageSlice.data.config.active);
  const pathNames = ['/storage/dashboard', '/storage/files', '/storage/config'];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'files', id: 'files' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'storage'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/storage/'}
      pathNames={pathNames}
      swagger={'storage'}
      icon={<Cloud />}>
      {children}
    </StyledLayout>
  );
};

export default StorageLayout;
