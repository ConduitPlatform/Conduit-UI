import React from 'react';

type LobbyProps = {
  children?: React.ReactNode;
};
export const Lobby: React.FC<LobbyProps> = ({ children }) => {
  return <>{children}</>;
};
