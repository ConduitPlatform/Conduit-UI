import { getPendingSchemas } from '@/lib/api/database';
import { IntrospectionClient } from './introspection-client';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export const dynamic = 'force-dynamic';

export default async function DatabaseIntrospectionPage() {
  const initialPending = await getPendingSchemas({ limit: 500 });

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader>
        <div>
          <PageTitle>Database introspection</PageTitle>
          <PageDescription>
            Discover collections from your database adapter and promote them to
            Conduit CMS schemas.
          </PageDescription>
        </div>
      </PageHeader>
      <IntrospectionClient initialPending={initialPending} />
    </div>
  );
}
