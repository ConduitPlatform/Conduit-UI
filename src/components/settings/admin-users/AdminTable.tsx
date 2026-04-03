'use client';
import { DataTable } from '@/components/authentication/components/data-table';
import { Admin } from '@/lib/models/User';
import { Button } from '@/components/ui/button';
import { AddAdminSheet } from '@/components/settings/admin-users/AddAdminSheet';
import Columns from '@/components/settings/admin-users/columns';
import EmptyAdmins from '@/components/settings/admin-users/emptyUsers';
import { useState } from 'react';

export default function AdminTable({
  data,
  count,
  loggedUser,
}: Readonly<{
  data: Admin[];
  count: number;
  loggedUser: Admin;
}>) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="container mx-auto py-10">
      <div className={'flex flex-row justify-end pb-2'}>
        <AddAdminSheet open={addOpen} onOpenChange={setAddOpen}>
          <Button variant="outline">Create</Button>
        </AddAdminSheet>
      </div>
      <DataTable
        columns={Columns({ loggedUser: loggedUser._id })}
        count={count}
        data={data}
      >
        <EmptyAdmins userAdd={() => setAddOpen(true)} />
      </DataTable>
    </div>
  );
}
