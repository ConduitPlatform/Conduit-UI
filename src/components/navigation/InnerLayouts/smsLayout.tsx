import React from 'react';
import SharedLayout from './sharedLayout';
import { Sms } from '@material-ui/icons';

const SMSLayout: React.FC = ({ children }) => {
  const pathNames = ['/sms/send', '/sms/config'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
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
