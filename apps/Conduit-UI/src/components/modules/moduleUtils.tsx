import React from 'react';
import {
  AltRoute,
  Chat,
  Cloud,
  Email,
  FormatAlignLeft,
  Home,
  Notifications,
  Payment,
  People,
  Settings,
  Sms,
  Toc,
  ViewModule,
} from '@mui/icons-material';
import { IModule } from '../../models/appAuth';

const modules = [
  'authentication',
  'email',
  'storage',
  'forms',
  'pushNotifications',
  'sms',
  'chat',
  'payments',
  'database',
  'router',
];

export const getDisabledModules = (payloadModules: string[]) => {
  const disabledModules: IModule[] = [];
  modules?.forEach((module) => {
    if (!payloadModules?.includes(module)) {
      disabledModules.push({
        moduleName: module,
        url: '',
        serving: false,
      });
    }
  });
  return disabledModules;
};

export const getSortedModules = (payloadModules: IModule[]) => {
  const sortedModules: IModule[] = [];
  modules?.forEach((module) => {
    payloadModules?.forEach((innerModule) => {
      if (module === innerModule.moduleName) sortedModules.push(innerModule);
    });
  });
  return sortedModules;
};

export const getModuleIcon = (moduleName: string) => {
  switch (moduleName) {
    case 'home':
      return <Home color={'inherit'} />;
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

export const isModuleOnline = (pathName: string, onlineModules: IModule[]) => {
  const splitPathName = pathName?.split('/')?.[1];

  switch (splitPathName) {
    case '':
    case '404':
    case '500':
    case 'login':
    case 'settings':
      return true;
    case 'push-notifications':
      return onlineModules?.some((item) => item.moduleName === 'pushNotifications');
    default:
      return onlineModules?.some((item) => item.moduleName === splitPathName);
  }
};
