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
      return <People color={'inherit'} width={24} height={24} />;
    case 'pushNotifications':
      return <Notifications color={'inherit'} width={24} height={24} />;
    case 'sms':
      return <Sms color={'inherit'} width={24} height={24} />;
    case 'email':
      return <Email color={'inherit'} width={24} height={24} />;
    case 'storage':
      return <Cloud color={'inherit'} width={24} height={24} />;
    case 'settings':
      return <Settings color={'inherit'} width={24} height={24} />;
    case 'chat':
      return <Chat color={'inherit'} width={24} height={24} />;
    case 'forms':
      return <FormatAlignLeft color={'inherit'} width={24} height={24} />;
    case 'payments':
      return <Payment color={'inherit'} width={24} height={24} />;
    case 'router':
      return <AltRoute color={'inherit'} width={24} height={24} />;
    case 'database':
      return <Toc color={'inherit'} width={24} height={24} />;
    default:
      return <ViewModule color={'inherit'} width={24} height={24} />;
  }
};

export const getModuleName = (moduleName: string) => {
  if (moduleName === 'pushNotifications') return 'Push Notifications';
  if (moduleName === 'sms') return 'SMS';
  return moduleName;
};
