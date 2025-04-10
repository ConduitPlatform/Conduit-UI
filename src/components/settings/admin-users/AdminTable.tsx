'use client';
import { DataTable } from '@/components/authentication/components/data-table';
import { Admin } from '@/lib/models/User';
import { Button } from '@/components/ui/button';
import { AddAdminSheet } from '@/components/settings/admin-users/AddAdminSheet';
import Columns from '@/components/settings/admin-users/columns';
import EmptyAdmins from '@/components/settings/admin-users/emptyUsers';

export default function AdminTable({
  data,
  count,
  loggedUser,
}: Readonly<{
  data: Admin[];
  count: number;
  loggedUser: Admin;
}>) {
  return (
    <div className="container mx-auto py-10">
      <div className={'flex flex-row justify-end pb-2'}>
        <AddAdminSheet>
          <Button variant="outline">Create</Button>
        </AddAdminSheet>
      </div>
      <DataTable
        columns={Columns({ loggedUser: loggedUser._id })}
        count={count}
        data={data}
      >
        <EmptyAdmins userAdd={() => {}} />
      </DataTable>
    </div>
  );
}
