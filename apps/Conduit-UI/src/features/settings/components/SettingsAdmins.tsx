import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { IAdmin, INewAdminUser } from '../models/SettingsModels';
import {
  asyncChangeOtherAdminsPassword,
  asyncCreateAdminUser,
  asyncDeleteAdmin,
  asyncGetAdminById,
  asyncGetAdmins,
} from '../store/settingsSlice';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableContainer,
} from '@conduitplatform/ui-components';
import CreateNewUserModal from './CreateNewAdminUserTab';
import ChangeOtherAdminsPassword from './ChangeAdminPassword';
import { enqueueErrorNotification } from '../../../hooks/useNotifier';
import { getErrorData } from '../../../utils/error-handler';

const SettingsAdmins: React.FC = () => {
  const dispatch = useAppDispatch();
  const { admins, count } = useAppSelector((state) => state.settingsSlice.data.authAdmins);
  const loggedInAdmin = useAppSelector((state) => state.settingsSlice.data.selectedAdmin);
  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [selectedAdmin, setSelectedAdmin] = useState<IAdmin>({
    createdAt: '',
    email: '',
    username: '',
    hasTwoFa: false,
    isSuperAdmin: false,
    updatedAt: '',
    _id: '',
  });
  const [drawer, setDrawer] = useState<{ open: boolean; action: string }>({
    open: false,
    action: '',
  });
  const [openDeleteUser, setOpenDeleteUser] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [deleteLoggedInUser, setDeleteLoggedInUser] = useState<{
    open: boolean;
    multiple: boolean;
  }>({
    open: false,
    multiple: false,
  });

  useEffect(() => {
    dispatch(asyncGetAdmins({ skip, limit }));
  }, [dispatch, limit, skip]);

  useEffect(() => {
    dispatch(asyncGetAdminById('me'));
  }, [dispatch]);

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

  const handleAction = (action: { title: string; type: string }, data: IAdmin) => {
    const currentUser = admins.find((admin: IAdmin) => admin._id === data._id) as IAdmin;
    if (action.type === 'delete') {
      if (data.username === loggedInAdmin.username) {
        enqueueErrorNotification(`Cannot delete self.`);
        return;
      } else {
        setOpenDeleteUser({
          open: true,
          multiple: false,
        });
      }
      setSelectedAdmin(currentUser);
    } else if (action.type === 'edit') {
      if (data.username === loggedInAdmin.username) {
        enqueueErrorNotification(`You must go to your profile to change your password.`);
        return;
      }
      setDrawer({ open: true, action: 'edit' });
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

  const handleCloseDeleteSignedInUser = () => {
    setDeleteLoggedInUser({
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
    { title: 'username', sort: 'username' },
    { title: 'Registered At', sort: 'createdAt' },
  ];

  const formatData = (admins: IAdmin[]) => {
    return admins?.map((u) => {
      return {
        _id: u._id,
        username: u.username,
        'Registered At': u.createdAt,
      };
    });
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toEdit = {
    title: 'Change password',
    type: 'edit',
  };

  const actions = [toEdit, toDelete];

  const handleDeleteTitle = (multiple: boolean, admin: IAdmin) => {
    return `Delete admin ${admin.username}`;
  };

  const handleDeleteDescription = (multiple: boolean, admin: IAdmin) => {
    return `Are you sure you want to delete ${admin.username}?`;
  };

  const handleAddNewUser = (values: INewAdminUser) => {
    dispatch(asyncCreateAdminUser({ values: values, getAdmins: getAdminsCallback }));
    setDrawer({ open: false, action: '' });
  };

  const handleChangePassword = (password: string) => {
    dispatch(asyncChangeOtherAdminsPassword({ adminId: selectedAdmin._id, newPassword: password }));
    setDrawer({ open: false, action: '' });
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => setDrawer({ open: true, action: 'create' })}
          endIcon={<Add />}>
          Create
        </Button>
      </Box>

      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!admins?.length ? 'admins' : undefined}>
        <DataTable
          headers={headers}
          dsData={formatData(admins)}
          actions={actions}
          handleAction={handleAction}
          selectable={false}
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
      <ConfirmationDialog
        open={deleteLoggedInUser.open}
        handleClose={handleCloseDeleteSignedInUser}
        title={'You cannot delete the account you are currently logged in with!'}
        buttonAction={handleCloseDeleteSignedInUser}
        buttonText={'Exit'}
        showCancelButton={false}
      />
      <SideDrawerWrapper
        open={drawer.open}
        maxWidth={550}
        title={
          drawer.action === 'create'
            ? 'Create new admin user'
            : `Edit ${selectedAdmin.username} password`
        }
        closeDrawer={() => {
          setDrawer({ open: false, action: '' });
        }}>
        {drawer.action === 'create' && <CreateNewUserModal handeAddNewUser={handleAddNewUser} />}
        {drawer.action === 'edit' && (
          <ChangeOtherAdminsPassword handleChangePassword={handleChangePassword} />
        )}
      </SideDrawerWrapper>
    </div>
  );
};

export default SettingsAdmins;
