import React from 'react';
import {
  Chat,
  Cloud,
  Email,
  FormatAlignLeft,
  Notifications,
  Payment,
  People,
  Security,
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
    case 'security':
      return <Security color={'inherit'} />;
    case 'database':
      return <Toc color={'inherit'} />;
    default:
      return <ViewModule color={'inherit'} />;
  }
};

export const getModuleName = (moduleName: string) => {
  if (moduleName === 'pushNotifications') return 'Push Notifications';
  return moduleName;
};

export const handleModuleNavigation = (moduleName: string) => {
  switch (moduleName) {
    case 'authentication':
      return '/authentication/users';
    case 'email':
      return '/email/templates';
    case 'database':
      return '/database/schemas';
    case 'storage':
      return '/storage/files';
    case 'settings':
      return '/settings/clientsdk';
    case 'pushNotifications':
      return '/push-notifications/send';
    case 'forms':
      return '/forms/view';
    case 'payments':
      return '/payments/customers';
    case 'sms':
      return '/sms/send';
    case 'security':
      return '/security/clients';
    case 'chat':
      return '/chat/rooms';
    default:
      return `/${moduleName}`;
  }
};
