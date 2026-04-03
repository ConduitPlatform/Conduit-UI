import { getPendingSchemas } from '@/lib/api/database';
import { IntrospectionClient } from './introspection-client';

export const dynamic = 'force-dynamic';

export default async function DatabaseIntrospectionPage() {
  const initialPending = await getPendingSchemas({ limit: 500 });

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">Database introspection</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Discover collections from your database adapter and promote them to
        Conduit CMS schemas.
      </p>
      <IntrospectionClient initialPending={initialPending} />
    </div>
  );
}
