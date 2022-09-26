import React from 'react';
import { Email } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const EmailsLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.emailsSlice.data.config.active);
  const pathNames = ['/email/dashboard', '/email/templates', '/email/send', '/email/config'];

  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'templates', id: 'templates' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'email'}
      labels={labels}
      docs={'https://getconduit.dev/docs/modules/email/'}
      pathNames={pathNames}
      swagger={'email'}
      icon={<Email />}>
      {children}
    </StyledLayout>
  );
};

export default EmailsLayout;
