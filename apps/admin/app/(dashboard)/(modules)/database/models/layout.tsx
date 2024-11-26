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
    <div className="h-full w-full absolute left-0 grid grid-cols-10 grid-rows-12">
      <DatabaseNavigation
        data={{
          views: [],
          pending: pending?.schemas ?? [],
          migrated: [],
        }}
        modules={modules.modules}
      />
      <div className="col-span-9 grid w-full row-span-11">{children}</div>
    </div>
  );
}
