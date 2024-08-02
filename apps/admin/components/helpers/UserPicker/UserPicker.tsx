'use client';
import * as React from 'react';
import { useCallback, useContext, useEffect } from 'react';
import { User } from '@/lib/models/User';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPickerTable } from '@/components/helpers/UserPicker/Table/UserPickerTable';
import { columns } from '@/components/helpers/UserPicker/Table/columns';
import { getUsers } from '@/lib/api/authentication';
import { Input } from '@/components/ui/input';

type UserPickerOptions = {
  multiple?: boolean;
  title?: string;
  description?: string;
}
type PickerDialog = UserPickerOptions & {
  callback: (users: User[]) => void;
}

type UserPickerProvider = {
  openPicker: (callback: (users: User[]) => void, options?: UserPickerOptions) => void;
}

const initialState: UserPickerProvider = {
  openPicker: () => {
    throw new Error('Not implemented');
  },
};

const UserPickerContext = React.createContext(initialState);

export const useUserPicker = () => useContext(UserPickerContext);

export function UserPickerProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = React.useState<PickerDialog | undefined>(undefined);
  const [pickedUsers, setPickedUsers] = React.useState<User[]>([]);
  const [fetchParams, setFetchParams] = React.useState({ page: 1, limit: 10, count: 0 });
  const [searchString, setSearchString] = React.useState('');
  const [users, setUsers] = React.useState<User[]>([]);
  const [isOpen, setOpen] = React.useState(false);
  const openPicker = (callback: (users: User[]) => void, options?: UserPickerOptions) => {
    refreshUsers();
    setDialog({
      ...(options ?? {}),
      callback,
    });
    setOpen(true);
  };

  const refreshUsers = useCallback((bumpPage = false) => {
    const page = bumpPage ? fetchParams.page + 1 : fetchParams.page;
    getUsers((page - 1) * fetchParams.limit, fetchParams.limit, { search: searchString }).then((data) => {
      console.log(data);
      setFetchParams({
        ...fetchParams,
        page,
        count: data.count,
      });
      setUsers(data.users);
    });
  }, [fetchParams,searchString]);

  const pickUsers = useCallback((users: User[]) => {
    setPickedUsers(users);
  }, [pickedUsers]);

  const completeDialog = useCallback(() => {
    dialog!.callback(pickedUsers);
    setOpen(false);
  }, [pickedUsers, dialog]);

  useEffect(() => {
    if (!isOpen) {
      setDialog(undefined);
      setPickedUsers([]);
    }

  }, [open]);

  return <UserPickerContext.Provider
    value={{
      openPicker,
    }}
  >
    {dialog && (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className={'max-w-fit'}>
          <DialogHeader>
            <DialogTitle>{dialog.title ?? 'Are you sure?'}</DialogTitle>
            <DialogDescription>
              {dialog.description ?? 'You\'ll lose your changes if you don\'t save them.'}
            </DialogDescription>
          </DialogHeader>
          <div className={'flex flex-row justify-between pb-2'}>
            <Input placeholder={'Search'} className={'w-44'} onChange={(e) => {
              setSearchString(e.target.value);
              refreshUsers();
            }} />
          </div>
          <UserPickerTable columns={columns} data={users} onSelected={pickUsers} />
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{'Close'}</Button>
            <Button
              disabled={pickedUsers.length === 0}
              onClick={() => completeDialog()}>{'Accept'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    {children}
  </UserPickerContext.Provider>;
}
