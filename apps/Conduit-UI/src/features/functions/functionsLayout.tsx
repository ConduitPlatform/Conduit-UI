import React from 'react';
import { Code } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const FunctionsLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.functionsSlice.data.config.active);
  const pathNames = [
    '/functions/dashboard',
    '/functions/functions',
    '/functions/test',
    '/functions/config',
  ];

  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Functions', id: 'functions' },
    { name: 'Test', id: 'test' },
    { name: 'Config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'functions'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/functions/'}
      pathNames={pathNames}
      swagger={'functions'}
      icon={<Code />}>
      {children}
    </StyledLayout>
  );
};

export default FunctionsLayout;
