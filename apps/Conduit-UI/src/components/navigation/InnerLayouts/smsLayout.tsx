import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Sms } from '@mui/icons-material';
import { CONDUIT_API } from '../../../http/requestsConfig';

const SMSLayout: React.FC = ({ children }) => {
  const pathNames = ['/sms/send', '/sms/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
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
