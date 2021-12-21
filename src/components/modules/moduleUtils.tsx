import React from 'react';
import {
  Chat,
  Cloud,
  Email,
  FilterDrama,
  FormatAlignLeft,
  Notifications,
  Payment,
  People,
  Settings,
  Sms,
  Toc,
  ViewModule,
} from '@material-ui/icons';

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
    case 'cms':
      return <Toc color={'inherit'} />;
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
    case 'database':
      return <FilterDrama color={'inherit'} />;
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
      return '/emails/templates';
    case 'cms':
      return '/cms/schemas';
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
    case 'chat':
      return '/chat/rooms';
    default:
      return `/${moduleName}`;
  }
};
