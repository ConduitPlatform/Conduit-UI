import React from 'react';
import { Sms } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const SMSLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.smsSlice.data.config.active);
  const pathNames = ['/sms/send', '/sms/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      title={'SMS'}
      labels={labels}
      pathNames={pathNames}
      swagger={'sms'}
      icon={<Sms />}>
      {children}
    </StyledLayout>
  );
};

export default SMSLayout;
