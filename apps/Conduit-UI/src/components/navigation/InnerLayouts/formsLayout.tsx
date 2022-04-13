import React from 'react';
import { SharedLayout } from 'ui-components';
import { FormatAlignLeft } from '@mui/icons-material';

const FormsLayout: React.FC = ({ children }) => {
  const pathNames = ['/forms/view', '/forms/config'];

  const labels = [
    { name: 'view', id: 'view' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Forms'}
      labels={labels}
      pathNames={pathNames}
      swagger={'forms'}
      icon={<FormatAlignLeft />}>
      {children}
    </SharedLayout>
  );
};

export default FormsLayout;
