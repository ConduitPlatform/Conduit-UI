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
