import React from 'react';
import { FormatAlignLeft } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const FormsLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.formsSlice.data.config.active);
  const pathNames = ['/forms/dashboard', '/forms/view', '/forms/config'];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'view', id: 'view' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'forms'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/forms/'}
      pathNames={pathNames}
      swagger={'forms'}
      icon={<FormatAlignLeft />}>
      {children}
    </StyledLayout>
  );
};

export default FormsLayout;
