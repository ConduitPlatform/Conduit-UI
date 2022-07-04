import React from 'react';
import { Sms } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const SMSLayout: React.FC = ({ children }) => {
  const pathNames = ['/sms/send', '/sms/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      title={'SMS'}
      labels={labels}
      pathNames={pathNames}
      swagger={'sms'}
      graphQL={'sms'}
      icon={<Sms />}>
      {children}
    </StyledLayout>
  );
};

export default SMSLayout;
