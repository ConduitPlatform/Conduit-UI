'use client';

import {
  EmailTemplatesResponse,
  TemplatesTable,
} from '@/components/email/templates/tables/templates/data-table';
import { useColumns } from '@/components/email/templates/tables/templates/columns';
import { SearchInput } from '@/components/helpers/search';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ExternalTemplatesResponse,
  ExternalTemplatesTable,
} from '@/components/email/templates/tables/external/data-table';
import { columns } from '@/components/email/templates/tables/external/columns';
import { isNil } from 'lodash';
import { syncTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateTemplateSheet } from '@/components/email/templates/createTemplateSheet';

export const TemplatesDashboard = ({
  data,
  external,
}: {
  data: EmailTemplatesResponse;
  external: ExternalTemplatesResponse | null;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  return (
    <Tabs defaultValue="local">
      <div className="flex w-full items-center justify-end">
        <TabsList>
          <TabsTrigger value="local">Local Conduit Templates</TabsTrigger>
          <TabsTrigger value="external">External Templates</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="local">
        <div className="flex gap-x-3 items-center">
          <SearchInput />
          <Button
            variant={'secondary'}
            type="button"
            onClick={() =>
              syncTemplates()
                .then(() => {
                  toast({
                    title: 'Email',
                    description: 'Templates synced successfully',
                  });
                  router.refresh();
                })
                .catch(err =>
                  toast({
                    title: 'Email',
                    description: err.message,
                  })
                )
            }
          >
            Pull
          </Button>
          <CreateTemplateSheet />
        </div>
        <div className={'pr-2 w-7/12 mt-5'}>
          <p className={'text-xs text-[#94A3B8]'}>
            Warning: Pulling templates will overwrite only local changes, any
            external templates not registered in the system will not be synced.
          </p>
        </div>
        <TemplatesTable data={data} columns={useColumns()} />
      </TabsContent>
      <TabsContent value="external" className="overflow-auto h-full">
        {isNil(external) ? (
          <span>External Templates are not available</span>
        ) : (
          <ExternalTemplatesTable key={''} data={external} columns={columns} />
        )}
      </TabsContent>
    </Tabs>
  );
};
