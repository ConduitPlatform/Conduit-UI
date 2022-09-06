import React from 'react';
import { Toc } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const ChatLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.chatSlice.config.active);
  const pathNames = ['/chat/dashboard', '/chat/rooms', '/chat/config'];
  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Rooms', id: 'rooms' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      module={'chat'}
      labels={labels}
      pathNames={pathNames}
      swagger={'chat'}
      icon={<Toc />}
      configActive={configActive}>
      {children}
    </StyledLayout>
  );
};

export default ChatLayout;
