import React from 'react';
import { AltRoute } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const RouterLayout: React.FC = ({ children }) => {
  const pathNames = ['/router/dashboard', '/router/settings', '/router/security'];
  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'general', id: 'settingsRoute' },
    { name: 'security', id: 'security' },
  ];

  return (
    <StyledLayout
      configActive={true}
      module={'router'}
      labels={labels}
      pathNames={pathNames}
      swagger={'router'}
      icon={<AltRoute />}>
      {children}
    </StyledLayout>
  );
};

export default RouterLayout;
