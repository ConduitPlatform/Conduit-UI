import React from 'react';
import { Toc } from '@mui/icons-material';
import { SharedLayout } from '@conduitplatform/ui-components';
import { CONDUIT_API } from '../../../http/requestsConfig';

const ChatLayout: React.FC = ({ children }) => {
  const pathNames = ['/chat/rooms', '/chat/config'];
  const labels = [
    { name: 'Rooms', id: 'rooms' },
    { name: 'config', id: 'config' },
  ];

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
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
