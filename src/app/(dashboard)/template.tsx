'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { getRouterSettings } from '@/lib/api/router';
import { getAdminSettings } from '@/lib/api/settings';
import { ScalarIcon, SocketIcon } from '@/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogsDrawer } from '@/components/logs-viewer/LogsDrawer';
import { useSidebar } from '@/components/ui/sidebar';
import { getDatabaseType } from '@/lib/api/database';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, BookOpen } from 'lucide-react';

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
  payments: 'Payments',
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
  const { open } = useSidebar();
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [adminUrl, setAdminUrl] = useState<string>('');
  const [databaseType, setDatabaseType] = useState<string>('');
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
    if (moduleName === 'Database') {
      getDatabaseType().then(res => {
        setDatabaseType(res.result);
      });
    }
  }, [moduleName]);

  if (!moduleName)
    return (
      <>
        <LogsDrawer isSidebarOpen={open} />
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

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <div className="flex flex-col overflow-x-auto no-scrollbar">
      <div className="flex flex-row w-full justify-between px-4 py-2 border-b items-center sticky top-0 z-40 bg-background min-h-10">
        <div className="flex items-center gap-3 min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.length > 0 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {pathSegments.length === 1 ? (
                      <BreadcrumbPage className="flex items-center gap-2">
                        {moduleName}
                        {moduleName === 'Database' && databaseType && (
                          <Badge variant="secondary" className="ml-1">
                            {databaseType}
                          </Badge>
                        )}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={`/${pathSegments[0]}`}>
                          {moduleName}
                          {moduleName === 'Database' && databaseType && (
                            <Badge variant="secondary" className="ml-1">
                              {databaseType}
                            </Badge>
                          )}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {pathSegments.length > 1 && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {pathSegments[pathSegments.length - 1]
                            .split('-')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Docs
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {restApp && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Image
                      src="/swagger.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="mr-2"
                    />
                    <ScalarIcon className="mr-2 h-3.5 w-3.5" />
                    REST
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {RESTDocs.filter(d => d.enabled).map(doc => (
                      <DropdownMenuItem key={doc.title} asChild>
                        <Link href={doc.href} target="_blank" rel="noopener">
                          {doc.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {(graphqlApp || graphqlAdmin) && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Image
                      src="/graphql.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="mr-2"
                    />
                    GraphQL
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {GraphQLDocs.filter(d => d.enabled).map(doc => (
                      <DropdownMenuItem key={doc.title} asChild>
                        <Link href={doc.href} target="_blank" rel="noopener">
                          {doc.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {sockets && (
                <DropdownMenuItem asChild>
                  <Link
                    href="https://admin.socket.io/"
                    target="_blank"
                    rel="noopener"
                  >
                    <SocketIcon className="mr-2 h-3.5 w-3.5" />
                    Socket.io
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`https://getconduit.dev/docs/modules/${whichModule}`}
                  target="_blank"
                  rel="noopener"
                >
                  Documentation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="w-full h-full max-h-[90vh] main-scrollbar top-10">
        <div className="px-6 py-4 mx-auto max-w-(--breakpoint-2xl) overflow-x-auto">
          {children}
        </div>
      </div>
      <LogsDrawer isSidebarOpen={open} />
    </div>
  );
}
