import {
  BellDot,
  Database,
  Cog,
  FormInputIcon,
  HardDrive,
  Home,
  KeyRound,
  LucideMail,
  LucideMessageSquare,
  MessagesSquare,
  Router,
  User,
  Logs,
  Settings,
} from 'lucide-react';

export const navList = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
    },
    {
      title: 'Authentication',
      url: '/authentication',
      icon: User,
      items: [
        {
          title: 'Dashboard',
          url: '/authentication',
        },
        {
          title: 'Users',
          url: '/authentication/users',
        },
        {
          title: 'Teams',
          url: '/authentication/teams',
        },
        {
          title: 'Strategies',
          url: '/authentication/strategies',
        },
        {
          title: 'Settings',
          url: '/authentication/settings',
        },
      ],
    },
    {
      title: 'Authorization',
      url: '/authorization',
      icon: KeyRound,
      items: [
        {
          title: 'Dashboard',
          url: '/authorization',
        },
        {
          title: 'Settings',
          url: '/authorization/settings',
        },
      ],
    },
    {
      title: 'Chat',
      url: '/chat',
      icon: MessagesSquare,
      items: [
        {
          title: 'Dashboard',
          url: '/chat',
        },
        {
          title: 'Chat rooms',
          url: '/chat/rooms',
        },
        {
          title: 'Settings',
          url: '/chat/settings',
        },
      ],
    },
    {
      title: 'Database',
      url: '/database',
      icon: Database,
      items: [
        {
          title: 'Dashboard',
          url: '/database',
        },
        {
          title: 'Models',
          url: '/database/models',
        },
        {
          title: 'Introspection',
          url: '/database/introspection',
        },
        {
          title: 'Custom Queries',
          url: '/database/queries',
        },
      ],
    },
    {
      title: 'Email',
      url: '/email',
      icon: LucideMail,
      items: [
        {
          title: 'Dashboard',
          url: '/email',
        },
        {
          title: 'Templates',
          url: '/email/templates',
        },
        {
          title: 'Send',
          url: '/email/send',
        },
        {
          title: 'Settings',
          url: '/email/settings',
        },
      ],
    },
    {
      title: 'Forms',
      url: '/forms',
      icon: FormInputIcon,
      items: [
        {
          title: 'Dashboard',
          url: '/forms',
        },
        {
          title: 'Forms',
          url: '/forms/forms',
        },
        {
          title: 'Submissions',
          url: '/forms/submissions',
        },
        {
          title: 'Settings',
          url: '/forms/settings',
        },
        {
          title: 'Dashboard',
          url: '/functions',
        },
        {
          title: 'Functions',
          url: '/functions/functions',
        },
        {
          title: 'Test',
          url: '/functions/test',
        },
        {
          title: 'Settings',
          url: '/functions/settings',
        },
      ],
    },
    {
      title: 'Notifications',
      url: '/push-notifications',
      icon: BellDot,
      items: [
        {
          title: 'Dashboard',
          url: '/push-notifications',
        },
        {
          title: 'Tokens',
          url: '/push-notifications/tokens',
        },
        {
          title: 'Test Send',
          url: '/push-notifications/test',
        },
        {
          title: 'Settings',
          url: '/push-notifications/settings',
        },
      ],
    },
    {
      title: 'Router',
      url: '/router',
      icon: Router,
      items: [
        {
          title: 'Dashboard',
          url: '/router',
        },
        {
          title: 'Visualize',
          url: '/router/vizualize',
        },
        {
          title: 'Security',
          url: '/router/security',
        },
        {
          title: 'Settings',
          url: '/router/settings',
        },
      ],
    },
    {
      title: 'SMS',
      url: '/sms',
      icon: LucideMessageSquare,
      items: [
        {
          title: 'Dashboard',
          url: '/sms',
        },
        {
          title: 'Test Send',
          url: '/sms/send',
        },
        {
          title: 'Settings',
          url: '/sms/settings',
        },
      ],
    },
    {
      title: 'Storage',
      url: '/storage',
      icon: HardDrive,
      items: [
        {
          title: 'Dashboard',
          url: '/storage',
        },
        {
          title: 'Browse',
          url: '/storage/browse',
        },
        {
          title: 'Settings',
          url: '/storage/settings',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Logs Viewer',
      url: '/logs-viewer',
      icon: Logs,
    },
    {
      title: 'Settings',
      url: '/settings/general',
      icon: Settings,
      items: [
        {
          title: 'General',
          url: '/settings/general',
        },
        {
          title: 'User Settings',
          url: '/settings/user-settings',
        },
        {
          title: 'Admin Users',
          url: '/settings/admin-users',
        },
      ],
    },
  ],
};
