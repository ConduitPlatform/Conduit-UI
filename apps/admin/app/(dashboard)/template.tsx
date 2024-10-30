'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { getRouterSettings } from '@/lib/api/router';
import { getAdminSettings } from '@/lib/api/settings';
import { ScalarIcon, SocketIcon } from '@/icons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ListItem } from '@/components/ui/list-item';
import { LogsDrawer } from '@/components/logs-viewer/LogsDrawer';

const MODULE_NAMES: { [key: string]: string } = {
  settings: 'Settings',
  authentication: 'Authentication',
  authorization: 'Authorization',
  database: 'Database',
  storage: 'Storage',
  chat: 'Chat',
  forms: 'Forms',
  email: 'Email',
  sms: 'SMS',
  router: 'Router',
  functions: 'Functions',
  'push-notifications': 'Notifications',
};
export default function ModuleHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [graphqlApp, setGraphqlApp] = useState<boolean>(false);
  const [restApp, setRestApp] = useState<boolean>(false);
  const [sockets, setSockets] = useState<boolean>(false); // client sockets
  const [graphqlAdmin, setGraphqlAdmin] = useState<boolean>(false);
  const [restAdmin, setRestAdmin] = useState<boolean>(false);

  const [baseUrl, setBaseUrl] = useState<string>('');
  const [adminUrl, setAdminUrl] = useState<string>('');
  const pathname = usePathname();
  const whichModule = pathname.split('/')[1];
  const moduleName = MODULE_NAMES[pathname.split('/')[1]];

  useEffect(() => {
    getRouterSettings().then(res => {
      setGraphqlApp(res.config.transports.graphql);
      setRestApp(res.config.transports.rest);
      setSockets(res.config.transports.sockets);
      setBaseUrl(res.config.hostUrl);
    });
    getAdminSettings().then(res => {
      setAdminUrl(res.config.hostUrl);
      setGraphqlAdmin(res.config.transports.graphql);
      setRestAdmin(res.config.transports.rest);
    });
  }, []);

  if (!moduleName)
    return (
      <>
        <LogsDrawer />
        {children}
      </>
    );

  const RESTDocs: {
    title: string;
    href: string;
    description: string;
    enabled: boolean;
    download?: string;
  }[] = [
    {
      title: 'Swagger App',
      href: `${baseUrl}/swagger/#/${moduleName.toLowerCase()}`,
      description: 'App API visual documentation.',
      download: `${baseUrl}/swagger.json`,
      enabled: restApp,
    },
    {
      title: 'Scalar App',
      href: `${baseUrl}/reference/#tag/${moduleName.toLowerCase()}`,
      description: 'App interface using Scalar framework.',
      enabled: restApp,
    },
    {
      title: 'Swagger Admin',
      href: `${adminUrl}/swagger/#/${moduleName.toLowerCase()}`,
      description: 'Admin API visual documentation.',
      download: `${adminUrl}/swagger.json`,
      enabled: restAdmin,
    },
    {
      title: 'Scalar Admin',
      href: `${adminUrl}/reference/#tag/${moduleName.toLowerCase()}`,
      description: 'Admin interface using Scalar framework.',
      enabled: restAdmin,
    },
  ];

  const GraphQLDocs: {
    title: string;
    href: string;
    description: string;
    enabled: boolean;
  }[] = [
    {
      title: 'App Playground',
      href: `${baseUrl}/graphql`,
      description: 'Client Graphical, interactive, in-browser GraphQL IDE.',
      enabled: graphqlApp,
    },
    {
      title: 'Admin Playground',
      href: `${adminUrl}/graphql`,
      description: 'Admin Graphical, interactive, in-browser GraphQL IDE.',
      enabled: graphqlAdmin,
    },
  ];

  return (
    <div className={'flex flex-col max-h-screen'}>
      <div
        className={
          'flex flex-row w-full justify-between p-4 border-b items-center sticky top-0 z-40 bg-background'
        }
      >
        <h1 className={'font-light text-xl'}>{moduleName}</h1>
        <div className={'flex flex-row space-x-1.5'}>
          <NavigationMenu>
            <NavigationMenuList>
              {restApp && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <Image
                      src={'/swagger.svg'}
                      alt={'swagger'}
                      width={16}
                      height={16}
                      className={'mr-2'}
                    />
                    <ScalarIcon className={'mr-2 w-3 h-3'} />
                    REST
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="">
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {RESTDocs.map(component => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                          downloadUrl={component.download}
                          enabled={component.enabled}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              {(graphqlApp || graphqlAdmin) && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <Image
                      src={'/graphql.svg'}
                      alt={'graphql'}
                      width={16}
                      height={16}
                      className={'mr-2'}
                    />
                    GraphQL
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {GraphQLDocs.map(component => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                          enabled={component.enabled}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              {sockets && (
                <NavigationMenuItem>
                  <Link href="https://admin.socket.io/" target={'_blank'}>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle({
                        className:
                          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                      })}
                    >
                      <SocketIcon className={'mr-2 w-3 h-3'} />
                      Socket.io
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <Link
                  href={`https://getconduit.dev/docs/modules/${whichModule}`}
                  target={'_blank'}
                >
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle({
                      className:
                        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                    })}
                  >
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div className="container py-10 mx-auto">{children}</div>
      <LogsDrawer />
    </div>
  );
}
