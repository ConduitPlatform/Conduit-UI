import { getSchemas, getSchemaOwnerModules } from '@/lib/api/database';

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ModelsNewLayout({
  children,
}: Readonly<LayoutProps>) {
  // Pre-fetch schemas and modules for the page
  const [schemasData, modulesData] = await Promise.all([
    getSchemas({ limit: 1000, enabled: true }),
    getSchemaOwnerModules({ sort: 'name' }),
  ]);

  return <div className="flex flex-col h-full w-full">{children}</div>;
}
