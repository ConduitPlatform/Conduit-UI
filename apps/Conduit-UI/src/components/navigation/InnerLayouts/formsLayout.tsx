import React from 'react';
import { FormatAlignLeft } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const FormsLayout: React.FC = ({ children }) => {
  const pathNames = ['/forms/view', '/forms/config'];

  const labels = [
    { name: 'view', id: 'view' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
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
