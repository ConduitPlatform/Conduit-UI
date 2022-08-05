import React from 'react';
import { AltRoute } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const RouterLayout: React.FC = ({ children }) => {
  const pathNames = ['/router/settings', '/router/security', '/router/logs'];
  const labels = [
    { name: 'general', id: 'settingsRoute' },
    { name: 'security', id: 'security' },
    { name: 'logs', id: 'logs' },
  ];

  return (
    <StyledLayout
      configActive={true}
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
