import {
  CodeIcon,
  Database,
  HardDrive,
  Home,
  KeyRound,
  Logs,
  LucideMail,
  MessagesSquare,
  Router,
  Settings,
  User,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export type NavSubItem = {
  title: string;
  url: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: NavSubItem[];
};

export type NavGroup = {
  id: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: 'home',
    items: [{ title: 'Home', url: '/', icon: Home }],
  },
  {
    id: 'infrastructure',
    items: [
      {
        title: 'Authentication',
        url: '/authentication',
        icon: User,
        items: [
          { title: 'Users', url: '/authentication/users' },
          { title: 'Teams', url: '/authentication/teams' },
          {
            title: 'Permissions Models',
            url: '/authentication/permissions-models',
          },
          { title: 'Strategies', url: '/authentication/strategies' },
          { title: 'Settings', url: '/authentication/settings' },
        ],
      },
      {
        title: 'Authorization',
        url: '/authorization',
        icon: KeyRound,
        items: [
          { title: 'Resources', url: '/authorization/resources' },
          { title: 'Relations', url: '/authorization/relations' },
          { title: 'Permissions', url: '/authorization/permissions' },
          { title: 'Settings', url: '/authorization/settings' },
        ],
      },
      {
        title: 'Database',
        url: '/database',
        icon: Database,
        items: [
          { title: 'Models', url: '/database/models' },
          { title: 'Introspection', url: '/database/introspection' },
          { title: 'Custom Queries', url: '/database/queries' },
          { title: 'Settings', url: '/database/settings' },
        ],
      },
      {
        title: 'Storage',
        url: '/storage',
        icon: HardDrive,
        items: [
          { title: 'Browse', url: '/storage/browse' },
          { title: 'Settings', url: '/storage/settings' },
        ],
      },
      {
        title: 'Chat',
        url: '/chat',
        icon: MessagesSquare,
        items: [
          { title: 'Chat rooms', url: '/chat/rooms' },
          { title: 'Settings', url: '/chat/settings' },
        ],
      },
    ],
  },
  {
    id: 'communications',
    items: [
      {
        title: 'Communications',
        url: '/communications',
        icon: LucideMail,
        items: [
          { title: 'Overview', url: '/communications' },
          { title: 'Templates', url: '/communications/templates' },
          { title: 'Logs & Devices', url: '/communications/logs' },
          { title: 'Settings', url: '/communications/settings' },
        ],
      },
    ],
  },
  {
    id: 'platform',
    items: [
      {
        title: 'Functions',
        url: '/functions',
        icon: CodeIcon,
        items: [
          { title: 'Functions', url: '/functions/functions' },
          { title: 'Test', url: '/functions/test' },
          { title: 'Settings', url: '/functions/settings' },
        ],
      },
      {
        title: 'Router',
        url: '/router',
        icon: Router,
        items: [
          { title: 'Visualize', url: '/router/vizualize' },
          { title: 'Security', url: '/router/security' },
          { title: 'Settings', url: '/router/settings' },
        ],
      },
      {
        title: 'Payments',
        url: '/payments',
        icon: CreditCard,
        items: [
          { title: 'Customers', url: '/payments/customers' },
          { title: 'Balances', url: '/payments/balances' },
          { title: 'Products', url: '/payments/products' },
          { title: 'Redeem codes', url: '/payments/redeem-codes' },
          { title: 'Transactions', url: '/payments/transactions' },
          { title: 'Subscriptions', url: '/payments/subscriptions' },
          { title: 'Settings', url: '/payments/settings' },
        ],
      },
    ],
  },
];

export const navFooter: NavItem = {
  title: 'Settings',
  url: '/settings/general',
  icon: Settings,
  items: [
    { title: 'General', url: '/settings/general' },
    { title: 'User Settings', url: '/settings/user-settings' },
    { title: 'Admin Users', url: '/settings/admin-users' },
    { title: 'API Tokens', url: '/settings/api-tokens' },
  ],
};

export const logsViewer: NavItem = {
  title: 'Logs Viewer',
  url: '/logs-viewer',
  icon: Logs,
};

// Backward-compatible flat exports for consumers like commandPalette.tsx
function flattenGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap(g => g.items);
}

export const navList = {
  navMain: flattenGroups(navGroups),
  navSecondary: [logsViewer, navFooter],
};
