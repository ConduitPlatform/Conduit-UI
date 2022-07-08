import React from 'react';
import { Email } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const EmailsLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.emailsSlice.data.config.active);
  const pathNames = ['/email/templates', '/email/send', '/email/config'];

  const labels = [
    { name: 'templates', id: 'templates' },
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      title={'Email'}
      labels={labels}
      pathNames={pathNames}
      swagger={'email'}
      graphQL={'email'}
      icon={<Email />}>
      {children}
    </StyledLayout>
  );
};

export default EmailsLayout;
