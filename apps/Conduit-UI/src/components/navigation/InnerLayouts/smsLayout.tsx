import React from 'react';
import { Sms } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const SMSLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.smsSlice.data.config.active);
  const pathNames = ['/sms/dashboard', '/sms/send', '/sms/config'];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'sms'}
      labels={labels}
      pathNames={pathNames}
      swagger={'sms'}
      icon={<Sms />}>
      {children}
    </StyledLayout>
  );
};

export default SMSLayout;
