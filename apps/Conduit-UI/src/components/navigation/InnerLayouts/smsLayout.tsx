import React from 'react';
import { SharedLayout } from 'ui-components';
import { Sms } from '@mui/icons-material';

const SMSLayout: React.FC = ({ children }) => {
  const pathNames = ['/sms/send', '/sms/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'SMS'}
      labels={labels}
      pathNames={pathNames}
      swagger={'sms'}
      icon={<Sms />}>
      {children}
    </SharedLayout>
  );
};

export default SMSLayout;
