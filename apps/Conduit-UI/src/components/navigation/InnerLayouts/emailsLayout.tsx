import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { Email } from '@mui/icons-material';

const EmailsLayout: React.FC = ({ children }) => {
  const pathNames = ['/email/templates', '/email/send', '/email/config'];

  const labels = [
    { name: 'templates', id: 'templates' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Email'}
      labels={labels}
      pathNames={pathNames}
      swagger={'email'}
      icon={<Email />}>
      {children}
    </SharedLayout>
  );
};

export default EmailsLayout;
