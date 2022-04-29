import React from 'react';
import { Toc } from '@mui/icons-material';
import { SharedLayout } from '@conduitplatform/ui-components';

const ChatLayout: React.FC = ({ children }) => {
  const pathNames = ['/chat/rooms', '/chat/config'];
  const labels = [
    { name: 'Rooms', id: 'rooms' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Chat'}
      labels={labels}
      pathNames={pathNames}
      swagger={'chat'}
      icon={<Toc />}>
      {children}
    </SharedLayout>
  );
};

export default ChatLayout;
