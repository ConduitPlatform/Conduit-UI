import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
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
      baseUrl={`${process.env.CONDUIT_URL}`}
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
