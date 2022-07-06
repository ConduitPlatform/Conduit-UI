import React from 'react';
import { FormatAlignLeft } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const FormsLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.formsSlice.data.config.active);
  const pathNames = ['/forms/view', '/forms/config'];

  const labels = [
    { name: 'view', id: 'view' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      title={'Forms'}
      labels={labels}
      pathNames={pathNames}
      swagger={'forms'}
      graphQL={'forms'}
      icon={<FormatAlignLeft />}>
      {children}
    </StyledLayout>
  );
};

export default FormsLayout;
