import { getPendingSchemas, getSchemaOwnerModules } from '@/lib/api/database';
import { DatabaseNavigation } from '@/components/database/navigation';

type LayoutProps = {
  children: React.ReactNode;
};

export default async function DatabaseLayout({ children }: LayoutProps) {
  const pendingPromise = getPendingSchemas({ limit: 100 });
  const modulesPromise = getSchemaOwnerModules({ sort: 'name' });
  const [pending, modules] = await Promise.all([
    pendingPromise,
    modulesPromise,
  ]);

  return (
    <div className="h-full flex">
      <DatabaseNavigation
        data={{
          views: [],
          pending: pending?.schemas ?? [],
          migrated: [],
        }}
        modules={modules.modules}
      />
      <div className="w-full grid">{children}</div>
    </div>
  );
}
