'use client';

import {
  EmailTemplatesResponse,
  TemplatesTable,
} from '@/components/email/templates/tables/templates/data-table';
import { useColumns } from '@/components/email/templates/tables/templates/columns';
import { SearchInput } from '@/components/helpers/search';
import React from 'react';

export const TemplatesDashboard = ({
  data,
}: {
  data: EmailTemplatesResponse;
}) => {
  return (
    <>
      <SearchInput />
      <TemplatesTable data={data} columns={useColumns()} />
    </>
  );
};
