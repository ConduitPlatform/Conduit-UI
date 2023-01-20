import React from 'react';
import { Security } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const AuthorizationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.authorizationSlice.config.active);
  const pathNames = [
    '/authorization/dashboard',
    '/authorization/resources',
    '/authorization/relations',
    '/authorization/config',
  ];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'resources', id: 'resources' },
    { name: 'relations', id: 'relations' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'authorization'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/authorization/'}
      pathNames={pathNames}
      swagger={'authorization'}
      icon={<Security />}>
      {children}
    </StyledLayout>
  );
};

export default AuthorizationLayout;
