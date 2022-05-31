import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { asyncDeleteAdmin, asyncGetAdmins } from '../../redux/slices/authenticationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ConfirmationDialog, DataTable, TableContainer } from '@conduitplatform/ui-components';
import { AuthUser, AuthUserUI } from '../../models/authentication/AuthModels';
import { handleDeleteDescription, handleDeleteTitle } from '../../utils/userDialog';
import { TableActionsContainer } from '@conduitplatform/ui-components';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';

const Admins = () => {
  const dispatch = useAppDispatch();
  const { admins, count } = useAppSelector((state) => state.authenticationSlice.data.authAdmins);
  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [selectedAdmin, setSelectedAdmin] = useState<AuthUser>({
    active: false,
    createdAt: '',
    email: '',
    isVerified: false,
    phoneNumber: '',
    updatedAt: '',
    _id: '',
  });

  const [openDeleteUser, setOpenDeleteUser] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });

  useEffect(() => {
    dispatch(asyncGetAdmins({ skip, limit }));
  }, [dispatch, limit, skip]);

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, val: number) => {
    if (val > page) {
      setPage(page + 1);
      setSkip(skip + limit);
    } else {
      setPage(page - 1);
      setSkip(skip - limit);
    }
  };

  const handleAction = (action: { title: string; type: string }, data: AuthUserUI) => {
    const currentUser = admins.find((user) => user._id === data._id) as AuthUser;
    if (action.type === 'delete') {
      setOpenDeleteUser({
        open: true,
        multiple: false,
      });
      setSelectedAdmin(currentUser);
    }
  };

  const getAdminsCallback = useCallback(() => {
    dispatch(asyncGetAdmins({ skip, limit }));
  }, [dispatch, limit, skip]);

  const handleClose = () => {
    setOpenDeleteUser({
      open: false,
      multiple: false,
    });
  };

  const deleteButtonAction = () => {
    const params = {
      id: selectedAdmin._id,
      getAdmins: getAdminsCallback,
    };
    dispatch(asyncDeleteAdmin(params));
    setOpenDeleteUser({
      open: false,
      multiple: false,
    });
  };

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Email', sort: 'email' },
    { title: 'Active', sort: 'active' },
    { title: 'Verified', sort: 'isVerified' },
    { title: 'Registered At', sort: 'createdAt' },
  ];

  const formatData = (admins: AuthUser[]) => {
    return admins.map((u) => {
      return {
        _id: u._id,
        Email: u.email ? u.email : 'N/A',
        Active: u.active,
        Verified: u.isVerified,
        'Registered At': u.createdAt,
      };
    });
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const actions = [toDelete];

  return (
    <div>
      <TableActionsContainer />
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!admins.length ? 'admins' : undefined}>
        <DataTable
          headers={headers}
          dsData={formatData(admins)}
          actions={actions}
          handleAction={handleAction}
        />
      </TableContainer>
      <ConfirmationDialog
        open={openDeleteUser.open}
        handleClose={handleClose}
        title={handleDeleteTitle(openDeleteUser.multiple, selectedAdmin)}
        description={handleDeleteDescription(openDeleteUser.multiple, selectedAdmin)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </div>
  );
};

Admins.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Admins;
