import React from 'react';
import { Toc } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const ChatLayout: React.FC = ({ children }) => {
  const pathNames = ['/chat/rooms', '/chat/config'];
  const labels = [
    { name: 'Rooms', id: 'rooms' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
      title={'Chat'}
      labels={labels}
      pathNames={pathNames}
      swagger={'chat'}
      icon={<Toc />}>
      {children}
    </StyledLayout>
  );
};

export default ChatLayout;
