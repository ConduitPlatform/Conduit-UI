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

export const TemplatesDashboard = ({
  data,
  external,
}: {
  data: EmailTemplatesResponse;
  external: ExternalTemplatesResponse | null;
}) => {
  return (
    <Tabs defaultValue="local">
      <TabsList>
        <TabsTrigger value="local">Local Conduit Templates</TabsTrigger>
        <TabsTrigger value="external">External Templates</TabsTrigger>
      </TabsList>
      <TabsContent value="local">
        <SearchInput />
        <TemplatesTable data={data} columns={useColumns()} />
      </TabsContent>
      <TabsContent value="external" className="overflow-auto h-full">
        {isNil(external) ? (
          <span>External Templates are not available</span>
        ) : (
          <ExternalTemplatesTable data={external} columns={columns} />
        )}
      </TabsContent>
    </Tabs>
  );
};
