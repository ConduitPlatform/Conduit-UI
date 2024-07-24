import {
  BellDot,
  BellPlus,
  Braces,
  Cog,
  Contact,
  Database,
  DatabaseBackup,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderSearch,
  FormInputIcon,
  HardDrive,
  Home,
  Key,
  KeyRound,
  KeySquare,
  Layers,
  LayoutTemplate,
  LucideAreaChart,
  LucideFunctionSquare,
  LucideMail,
  LucideMessageSquare,
  MessagesSquare,
  Network,
  Router,
  Send,
  User,
  Users2,
} from 'lucide-react';
import React from 'react';

export const NAV_ICON_CLASSES = 'h-6 w-6';
export const navList = [
  {
    name: 'Home',
    href: '/',
    icon: <Home className={NAV_ICON_CLASSES} />,
  },
  {
    name: 'Authentication',
    href: '/authentication',
    icon: <User className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/authentication',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Users',
        href: '/authentication/users',
        icon: <Contact className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Teams',
        href: '/authentication/teams',
        icon: <Users2 className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Strategies',
        href: '/authentication/strategies',
        icon: <Key className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/authentication/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Authorization',
    href: '/authorization',
    icon: <KeyRound className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/authorization',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/authorization/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: <MessagesSquare className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/chat',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Chat rooms',
        href: '/chat/rooms',
        icon: <Layers className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/chat/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Database',
    href: '/database',
    icon: <Database className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/database',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Models',
        href: '/database/models',
        icon: <FileText className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Introspection',
        href: '/database/introspection',
        icon: <DatabaseBackup className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Custom Queries',
        href: '/database/queries',
        icon: <Braces className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Email',
    href: '/email',
    icon: <LucideMail className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/email',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Templates',
        href: '/email/templates',
        icon: <LayoutTemplate className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Send',
        href: '/email/send',
        icon: <Send className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/email/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: <FormInputIcon className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/forms',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Forms',
        href: '/forms/forms',
        icon: <FileSpreadsheet className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Submissions',
        href: '/forms/submissions',
        icon: <FileCheck className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/forms/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Functions',
    href: '/functions',
    icon: <LucideFunctionSquare className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/functions',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Functions',
        href: '/functions/functions',
        icon: <LayoutTemplate className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Test',
        href: '/functions/test',
        icon: <Send className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/functions/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Notifications',
    href: '/push-notifications',
    icon: <BellDot className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/push-notifications',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Tokens',
        href: '/push-notifications/tokens',
        icon: <KeySquare className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Test Send',
        href: '/push-notifications/test',
        icon: <BellPlus className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/push-notifications/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Router',
    href: '/router',
    icon: <Router className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/router',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Visualize',
        href: '/router/vizualize',
        icon: <Network className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Security',
        href: '/router/security',
        icon: <KeySquare className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/router/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'SMS',
    href: '/sms',
    icon: <LucideMessageSquare className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/sms',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Test Send',
        href: '/sms/send',
        icon: <Send className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/sms/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
  {
    name: 'Storage',
    href: '/storage',
    icon: <HardDrive className={NAV_ICON_CLASSES} />,
    children: [
      {
        name: 'Dashboard',
        href: '/storage',
        icon: <LucideAreaChart className={NAV_ICON_CLASSES} />,
      }, {
        name: 'File browser',
        href: '/storage/files',
        icon: <FolderSearch className={NAV_ICON_CLASSES} />,
      }, {
        name: 'Settings',
        href: '/storage/settings',
        icon: <Cog className={NAV_ICON_CLASSES} />,
      },
    ],
  },
];
