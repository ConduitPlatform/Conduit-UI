import React from 'react';
import { Email } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const EmailsLayout: React.FC = ({ children }) => {
  const pathNames = ['/email/templates', '/email/send', '/email/config'];

  const labels = [
    { name: 'templates', id: 'templates' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Email'}
      labels={labels}
      pathNames={pathNames}
      swagger={'email'}
      icon={<Email />}>
      {children}
    </StyledLayout>
  );
};

export default EmailsLayout;
