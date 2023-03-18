import React from 'react';
import { AltRoute } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';

const RouterLayout: React.FC = ({ children }) => {
  const pathNames = ['/router/dashboard', '/router/settings', '/router/security'];
  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'General', id: 'settingsRoute' },
    { name: 'Security', id: 'security' },
  ];

  return (
    <StyledLayout
      configActive={true}
      module={'router'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/router/'}
      pathNames={pathNames}
      swagger={'router'}
      icon={<AltRoute />}>
      {children}
    </StyledLayout>
  );
};

export default RouterLayout;
