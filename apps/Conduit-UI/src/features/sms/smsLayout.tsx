import React from 'react';
import { Sms } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const SMSLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.smsSlice.data.config.active);
  const pathNames = ['/sms/dashboard', '/sms/send', '/sms/config'];

  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Send', id: 'send' },
    { name: 'Config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'sms'}
      labels={labels}
      pathNames={pathNames}
      docs={'https://getconduit.dev/docs/modules/sms/'}
      swagger={'sms'}
      icon={<Sms />}>
      {children}
    </StyledLayout>
  );
};

export default SMSLayout;
