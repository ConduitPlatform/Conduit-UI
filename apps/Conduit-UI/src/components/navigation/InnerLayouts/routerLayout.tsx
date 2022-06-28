import React from 'react';
import { AltRoute } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const RouterLayout: React.FC = ({ children }) => {
  const pathNames = ['/router/settings', '/router/security'];
  const labels = [
    { name: 'router', id: 'settingsRoute' },
    { name: 'security', id: 'security' },
  ];

  return (
    <StyledLayout
      title={'Router'}
      labels={labels}
      pathNames={pathNames}
      swagger={'router'}
      icon={<AltRoute />}>
      {children}
    </StyledLayout>
  );
};

export default RouterLayout;
