import React from 'react';
import {
  AltRoute,
  Chat,
  Cloud,
  Email,
  FormatAlignLeft,
  Notifications,
  Payment,
  People,
  Settings,
  Sms,
  Toc,
  ViewModule,
} from '@mui/icons-material';

export const getModuleIcon = (moduleName: string) => {
  switch (moduleName) {
    case 'authentication':
      return <People color={'inherit'} />;
    case 'pushNotifications':
      return <Notifications color={'inherit'} />;
    case 'sms':
      return <Sms color={'inherit'} />;
    case 'email':
      return <Email color={'inherit'} />;
    case 'storage':
      return <Cloud color={'inherit'} />;
    case 'settings':
      return <Settings color={'inherit'} />;
    case 'chat':
      return <Chat color={'inherit'} />;
    case 'forms':
      return <FormatAlignLeft color={'inherit'} />;
    case 'payments':
      return <Payment color={'inherit'} />;
    case 'router':
      return <AltRoute color={'inherit'} />;
    case 'database':
      return <Toc color={'inherit'} />;
    default:
      return <ViewModule color={'inherit'} />;
  }
};

export const getModuleName = (moduleName: string) => {
  if (moduleName === 'pushNotifications') return 'Push Notifications';
  if (moduleName === 'sms') return 'SMS';
  return moduleName;
};
