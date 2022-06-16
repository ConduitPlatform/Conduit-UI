import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import NewUserModal from '../../components/authentication/AddUserDrawer';
import AuthUsers from '../../components/authentication/AuthUsers';
import SearchFilter from '../../components/authentication/SearchFilter';
import { Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import useDebounce from '../../hooks/useDebounce';
import {
  asyncAddNewUser,
  asyncBlockUnblockUsers,
  asyncBlockUserUI,
  asyncDeleteUsers,
  asyncGetAuthenticationConfig,
  asyncGetAuthUserData,
  asyncUnblockUserUI,
} from '../../redux/slices/authenticationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import { ConfirmationDialog, TableContainer } from '@conduitplatform/ui-components';
import { AuthUser, AuthUserUI } from '../../models/authentication/AuthModels';
import EditUserDialog from '../../components/authentication/EditUserDialog';
import {
  handleBlockButton,
  handleBlockDescription,
  handleBlockTitle,
  handleDeleteDescription,
  handleDeleteTitle,
} from '../../utils/userDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { AddCircle } from '@mui/icons-material';
import { isString } from 'lodash';
import { SideDrawerWrapper, TableActionsContainer } from '@conduitplatform/ui-components';
import { prepareSort } from '../../utils/prepareSort';

const Users = () => {
  const dispatch = useAppDispatch();

  const { users, count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);

  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedUser, setSelectedUser] = useState<AuthUser>({
    active: false,
    createdAt: '',
    email: '',
    isVerified: false,
    phoneNumber: '',
    updatedAt: '',
    _id: '',
  });
  const [openBlockUI, setOpenBlockUI] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [openDeleteUser, setOpenDeleteUser] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [openEditUser, setOpenEditUser] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

  const handleFilterChange = (value: unknown) => {
    if (isString(value)) {
      setFilter(value);
    }
  };

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      asyncGetAuthUserData({
        skip,
        limit,
        search: debouncedSearch,
        provider: filter,
        sort: prepareSort(sort),
      })
    );
  }, [dispatch, filter, limit, skip, debouncedSearch, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch, filter]);

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

  const handleSelect = (id: string) => {
    const newSelectedUsers = [...selectedUsers];
    if (selectedUsers.includes(id)) {
      const index = newSelectedUsers.findIndex((newId) => newId === id);
      newSelectedUsers.splice(index, 1);
    } else {
      newSelectedUsers.push(id);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleSelectAll = (data: AuthUserUI[]) => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
      return;
    }
    const newSelectedUsers = data.map((item: AuthUserUI) => item._id);
    setSelectedUsers(newSelectedUsers);
  };

  const handleAction = (action: { title: string; type: string }, data: AuthUserUI) => {
    const currentUser = users.find((user) => user._id === data._id) as AuthUser;
    if (action.type === 'edit') {
      setOpenEditUser(true);
      setSelectedUser(currentUser);
    } else if (action.type === 'delete') {
      setOpenDeleteUser({
        open: true,
        multiple: false,
      });
      setSelectedUser(currentUser);
    } else if (action.type === 'block/unblock') {
      setOpenBlockUI({
        open: true,
        multiple: false,
      });
      setSelectedUser(currentUser);
    }
  };

  const getUsersCallback = useCallback(() => {
    dispatch(asyncGetAuthUserData({ skip, limit, search: debouncedSearch, provider: filter }));
  }, [debouncedSearch, dispatch, filter, limit, skip]);

  const handleNewUserDispatch = (values: { password: string; email: string }) => {
    dispatch(asyncAddNewUser({ values, getUsers: getUsersCallback }));
    setDrawer(false);
  };

  const handleBlock = () => {
    if (openBlockUI.multiple) {
      const selectedUsersObj: boolean[] = [];
      users.forEach((user) => {
        if (selectedUsers.includes(user._id)) {
          selectedUsersObj.push(user.active);
        }
      });
      const isActive = selectedUsersObj.some((active) => active);
      const params = {
        body: {
          ids: selectedUsers,
          block: !isActive,
        },
        getUsers: getUsersCallback,
      };
      dispatch(asyncBlockUnblockUsers(params));
      setOpenBlockUI({
        open: false,
        multiple: false,
      });
      return;
    }
    if (selectedUser.active) {
      dispatch(asyncBlockUserUI(selectedUser._id));
    } else {
      dispatch(asyncUnblockUserUI(selectedUser._id));
    }
    setOpenBlockUI({
      open: false,
      multiple: false,
    });
  };

  const handleClose = () => {
    setOpenDeleteUser({
      open: false,
      multiple: false,
    });
    setOpenBlockUI({
      open: false,
      multiple: false,
    });
    setOpenEditUser(false);
  };

  const deleteButtonAction = () => {
    if (openDeleteUser.open && openDeleteUser.multiple) {
      const params = {
        ids: selectedUsers,
        getUsers: getUsersCallback,
      };
      dispatch(asyncDeleteUsers(params));
    } else {
      const params = {
        ids: [`${selectedUser._id}`],
        getUsers: getUsersCallback,
      };
      dispatch(asyncDeleteUsers(params));
    }
    setOpenDeleteUser({
      open: false,
      multiple: false,
    });
    setSelectedUsers([]);
  };

  return (
    <div>
      <TableActionsContainer>
        <SearchFilter
          setSearch={setSearch}
          search={search}
          filter={filter}
          handleFilterChange={handleFilterChange}
        />
        {selectedUsers.length > 1 && (
          <ButtonGroup size="small" variant="contained" color="primary" sx={{ mr: 1 }}>
            <IconButton
              aria-label="block"
              onClick={() =>
                setOpenBlockUI({
                  open: true,
                  multiple: true,
                })
              }
              size="large">
              <Tooltip title="Block multiple users">
                <BlockIcon />
              </Tooltip>
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() =>
                setOpenDeleteUser({
                  open: true,
                  multiple: true,
                })
              }
              size="large">
              <Tooltip title="Delete multiple users">
                <DeleteIcon />
              </Tooltip>
            </IconButton>
          </ButtonGroup>
        )}
        <Button
          sx={{ whiteSpace: 'nowrap', ml: 1 }}
          color="primary"
          variant="contained"
          endIcon={<AddCircle />}
          onClick={() => setDrawer(true)}>
          ADD USER
        </Button>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!users.length ? 'users' : undefined}>
        <AuthUsers
          sort={sort}
          setSort={setSort}
          users={users}
          handleAction={handleAction}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedUsers={selectedUsers}
        />
      </TableContainer>
      <SideDrawerWrapper
        open={drawer}
        maxWidth={550}
        title="Add a new user"
        closeDrawer={() => {
          setDrawer(false);
        }}>
        <NewUserModal handleNewUserDispatch={handleNewUserDispatch} />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteUser.open}
        handleClose={handleClose}
        title={handleDeleteTitle(openDeleteUser.multiple, selectedUser)}
        description={handleDeleteDescription(openDeleteUser.multiple, selectedUser)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
      <ConfirmationDialog
        open={openBlockUI.open}
        handleClose={handleClose}
        title={handleBlockTitle(openBlockUI.multiple, selectedUser)}
        description={handleBlockDescription(openBlockUI.multiple, selectedUser)}
        buttonAction={handleBlock}
        buttonText={handleBlockButton(openBlockUI.multiple, selectedUser)}
      />
      <EditUserDialog open={openEditUser} data={selectedUser} handleClose={handleClose} />
    </div>
  );
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Users;
