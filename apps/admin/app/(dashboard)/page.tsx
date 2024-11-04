import { Stats } from '@/components/stats/stats';
import {
  Database,
  FunctionSquare,
  HardDrive,
  ListIcon,
  LucideMail,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SidebarCollapseTrigger from '@/components/navigation/sidebarCollapseTrigger';

const items = [
  {
    title: 'Setup auth',
    description: 'Add authentication to your app to keep your users safe.',
    icon: <User className="w-6 h-6" />,
    background: 'bg-pink-500',
    href: '/authentication/settings',
  },
  {
    title: 'Create a model',
    description:
      'Data is the heart of your app. Create a model to get started.',
    icon: <Database className="w-6 h-6" />,
    background: 'bg-yellow-500',
    href: '/database/models/create',
  },
  {
    title: 'Setup storage',
    description: 'Upload files to your app as easy as 1,2,3.',
    icon: <HardDrive className="w-6 h-6" />,
    background: 'bg-green-500',
    href: '/storage/settings',
  },
  {
    title: 'Setup email',
    description: 'Send emails to your users to keep them engaged.',
    icon: <LucideMail className="w-6 h-6" />,
    background: 'bg-blue-500',
    href: '/email/settings',
  },
  {
    title: 'Add a function',
    description: 'Add a function to your app to run code on the server.',
    icon: <FunctionSquare className="w-6 h-6" />,
    background: 'bg-indigo-500',
    href: '/functions/create',
  },
  {
    title: 'Create a custom query',
    description: 'Create a custom query to fetch data from your database.',
    icon: <ListIcon className="w-6 h-6" />,
    background: 'bg-purple-500',
    href: '/database/queries/create',
  },
];
export default function Home() {
  return (
    <>
      <SidebarCollapseTrigger className="absolute left-3 top-3" />
      <div className="flex flex-col items-center justify-between min-h-screen p-24">
        <Stats
          stats={[
            { name: 'Requests', value: '0', unit: 'per second' },
            {
              name: 'Avg latency',
              value: 'N/A',
              unit: 'ms',
            },
            { name: 'Users', value: 'N/A' },
            { name: 'Active Routes', value: '0' },
          ]}
        />

        <div>
          <h2 className="text-base font-semibold leading-6 text-foreground">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-foreground">
            Not sure what to do next? Check below
          </p>
          <ul
            role="list"
            className="grid grid-cols-2 gap-6 py-6 mt-6 border-t border-b border-border"
          >
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flow-root">
                <div className="relative flex items-center p-2 -m-2 space-x-4 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-secondary">
                  <div
                    className={cn(
                      item.background,
                      'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg'
                    )}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      <Link href={item.href} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <span>{item.title}</span>
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex mt-4">
            <Link
              href="https://getconduit.dev/docs/overview/intro"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              target="_blank"
            >
              Or read the docs
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
