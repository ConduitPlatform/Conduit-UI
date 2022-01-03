import React from 'react';
import SharedLayout from './sharedLayout';
import { Email } from '@material-ui/icons';

const EmailsLayout: React.FC = ({ children }) => {
  const pathNames = ['/email/templates', '/email/send', '/email/config'];

  const labels = [
    { name: 'templates', id: 'templates' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      title={'Emails'}
      labels={labels}
      pathNames={pathNames}
      swagger={'cms'}
      icon={<Email />}>
      {children}
    </SharedLayout>
  );
};

export default EmailsLayout;
