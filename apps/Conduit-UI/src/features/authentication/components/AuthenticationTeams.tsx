import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useDebounce from '../../../hooks/useDebounce';
import { prepareSort } from '../../../utils/prepareSort';
import {
  ConfirmationDialog,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import { Box, Button, ButtonGroup, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import AuthTeams from '../models/AuthTeams';
import { AuthTeam, AuthTeamFields, AuthTeamUI, AuthUser, AuthUserUI } from '../models/AuthModels';
import {
  asyncAddNewTeam,
  asyncAddNewTeamMembers,
  asyncDeleteTeam,
  asyncDeleteTeamMembers,
  asyncEditTeam,
  asyncEditTeamMembers,
  asyncGetAuthenticationConfig,
  asyncGetAuthTeamData,
  asyncGetAuthTeamMembersData,
} from '../store/authenticationSlice';
import TeamDrawer from './TeamDrawer';
import { handleDeleteTeamDescription, handleDeleteTeamTitle } from './teamDialog';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import TeamPath from './TeamPath';
import AuthUsers from '../models/AuthUsers';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { handleDeleteTeamMemberDescription, handleDeleteTeamMemberTitle } from './teamMemberDialog';
import EditTeamMembersDialog from './EditTeamMembersDialog';
import AddTeamMemberDrawer from './AddTeamMemberDrawer';

const Teams: React.FC = () => {
  const dispatch = useAppDispatch();

  const { teams, count, teamMembers, membersCount } = useAppSelector(
    (state) => state.authenticationSlice.data.authTeams
  );

  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });

  const [membersPage, setMembersPage] = useState<number>(0);
  const [membersSkip, setMembersSkip] = useState<number>(0);
  const [membersLimit, setMembersLimit] = useState<number>(25);
  const [membersSearch, setMembersSearch] = useState<string>('');
  const [membersSort, setMembersSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });

  const [selectedTeam, setSelectedTeam] = useState<AuthTeam[]>();
  const [teamToEdit, setTeamToEdit] = useState<AuthTeam>();
  const [openDeleteTeam, setOpenDeleteTeam] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<AuthUser>({
    active: false,
    createdAt: '',
    email: '',
    isVerified: false,
    phoneNumber: '',
    updatedAt: '',
    _id: '',
  });
  const [openEditUser, setOpenEditUser] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [drawerAddMember, setDrawerAddMember] = useState<boolean>(false);
  const [openDeleteUser, setOpenDeleteUser] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });

  const [tab, setTab] = useState<'teams' | 'members'>('teams');

  const debouncedSearch: string = useDebounce(search, 500);
  const debouncedMemberSearch: string = useDebounce(membersSearch, 500);

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  const getTeamsCallback = useCallback(() => {
    dispatch(
      asyncGetAuthTeamData({
        skip,
        limit,
        search: debouncedSearch,
        sort: prepareSort(sort),
        parentTeam: selectedTeam?.[selectedTeam.length - 1]?._id,
      })
    );
  }, [dispatch, skip, limit, debouncedSearch, sort, selectedTeam]);

  const getTeamMembersCallback = useCallback(
    (teamId: string) => {
      dispatch(
        asyncGetAuthTeamMembersData({
          _id: teamId,
          skip: membersSkip,
          limit: membersLimit,
          search: debouncedMemberSearch,
          sort: prepareSort(membersSort),
        })
      );
    },
    [dispatch, membersLimit, membersSkip, membersSort, debouncedMemberSearch]
  );

  useEffect(() => {
    getTeamsCallback();
  }, [getTeamsCallback]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setSearch('');
    setMembersSkip(0);
    setMembersPage(0);
    setMembersSearch('');
    if (selectedTeam?.[selectedTeam.length - 1]?._id) {
      getTeamMembersCallback(selectedTeam[selectedTeam.length - 1]._id);
    } else {
      setTab('teams');
    }
  }, [getTeamMembersCallback, selectedTeam, setTab]);

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  const handleMembersLimitChange = (value: number) => {
    setMembersLimit(value);
    setMembersSkip(0);
    setMembersPage(0);
    setMembersSearch('');
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

  const handleMembersPageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    val: number
  ) => {
    if (val > membersPage) {
      setMembersPage(membersPage + 1);
      setMembersSkip(membersSkip + membersLimit);
    } else {
      setMembersPage(membersPage - 1);
      setMembersSkip(membersSkip - membersLimit);
    }
  };
  const handleAction = (action: { title: string; type: string }, data: AuthTeamUI) => {
    const currentTeam = teams.find((team: AuthTeam) => team._id === data._id) as AuthTeam;
    if (action.type === 'edit') {
      setDrawer(true);
      setTeamToEdit(currentTeam);
    } else if (action.type === 'delete') {
      setOpenDeleteTeam(true);
      setTeamToEdit(currentTeam);
    }
  };

  const handleMemberAction = (action: { title: string; type: string }, data: AuthUserUI) => {
    const currentUser = teamMembers.find((member: AuthUser) => member._id === data._id) as AuthUser;
    if (action.type === 'edit') {
      setOpenEditUser({
        open: true,
        multiple: false,
      });
      setSelectedUser(currentUser);
    } else if (action.type === 'delete') {
      setOpenDeleteUser({
        open: true,
        multiple: false,
      });
      setSelectedUser(currentUser);
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
    if (selectedUsers.length === teamMembers.length) {
      setSelectedUsers([]);
      return;
    }
    const newSelectedUsers = data.map((item: AuthUserUI) => item._id);
    setSelectedUsers(newSelectedUsers);
  };

  const handleTeamDispatch = (values: { _id?: string } & AuthTeamFields) => {
    if (values._id) {
      dispatch(asyncEditTeam(values as { _id: string } & AuthTeamFields));
    } else {
      dispatch(asyncAddNewTeam({ values, getTeams: getTeamsCallback }));
    }
    setDrawer(false);
    setTeamToEdit(undefined);
  };

  const handleClose = () => {
    setOpenDeleteTeam(false);
    setDrawer(false);
    setTeamToEdit(undefined);
    setOpenEditUser({ open: false, multiple: false });
    setOpenDeleteUser({ open: false, multiple: false });
  };

  const deleteButtonAction = () => {
    if (!teamToEdit) return;
    const params = {
      id: `${teamToEdit._id}`,
      getTeams: getTeamsCallback,
    };
    dispatch(asyncDeleteTeam(params));
    setOpenDeleteTeam(false);
    setTeamToEdit(undefined);
  };

  const handleSelectTeam = useCallback(
    (data?: AuthTeam) => {
      if (!data) setSelectedTeam(undefined);
      else {
        if (selectedTeam && selectedTeam.length > 0) {
          if (selectedTeam[selectedTeam.length - 1]._id !== data.parentTeam) return;
          setSelectedTeam([...(selectedTeam ?? []), data]);
        } else {
          setSelectedTeam([data]);
        }
      }
    },
    [selectedTeam]
  );

  const editMemberButtonAction = (data: { role: 'owner' | 'member' }) => {
    if (openEditUser.multiple) {
      const params = {
        _id: selectedTeam?.[selectedTeam.length - 1]?._id ?? '',
        members: selectedUsers,
        role: data.role,
        getParams: {
          skip: membersSkip,
          limit: membersLimit,
          search: debouncedMemberSearch,
          sort: prepareSort(membersSort),
        },
      };
      dispatch(asyncEditTeamMembers(params));
    } else {
      const params = {
        _id: selectedTeam?.[selectedTeam.length - 1]?._id ?? '',
        members: [`${selectedUser._id}`],
        role: data.role,
        getParams: {
          skip: membersSkip,
          limit: membersLimit,
          search: debouncedMemberSearch,
          sort: prepareSort(membersSort),
        },
      };
      dispatch(asyncEditTeamMembers(params));
    }
    setOpenEditUser({
      open: false,
      multiple: false,
    });
    setSelectedUsers([]);
  };

  const deleteMemberButtonAction = () => {
    if (openDeleteUser.multiple) {
      const params = {
        _id: selectedTeam?.[selectedTeam.length - 1]?._id ?? '',
        members: selectedUsers,
        getParams: {
          skip: membersSkip,
          limit: membersLimit,
          search: debouncedMemberSearch,
          sort: prepareSort(membersSort),
        },
      };
      dispatch(asyncDeleteTeamMembers(params));
    } else {
      const params = {
        _id: selectedTeam?.[selectedTeam.length - 1]?._id ?? '',
        members: [`${selectedUser._id}`],
        getParams: {
          skip: membersSkip,
          limit: membersLimit,
          search: debouncedMemberSearch,
          sort: prepareSort(membersSort),
        },
      };
      dispatch(asyncDeleteTeamMembers(params));
    }
    setOpenDeleteUser({
      open: false,
      multiple: false,
    });
    setSelectedUsers([]);
  };

  const handleAddMemberDispatch = (values: { members: string[] }) => {
    const params = {
      values: {
        _id: selectedTeam?.[selectedTeam.length - 1]?._id ?? '',
        members: values.members,
      },
      getParams: {
        skip: membersSkip,
        limit: membersLimit,
        search: debouncedMemberSearch,
        sort: prepareSort(membersSort),
      },
    };
    dispatch(asyncAddNewTeamMembers(params));
    setDrawerAddMember(false);
  };

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
      }}>
      <TeamPath selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
      <Tabs
        sx={{ width: '100%', mb: 1 }}
        value={tab}
        onChange={(event, newValue) => setTab(newValue)}
        indicatorColor="primary"
        variant="fullWidth"
        textColor="primary">
        <Tab label="Teams" value={'teams'} />
        <Tab label="Members" value={'members'} disabled={!selectedTeam} />
      </Tabs>
      {tab === 'members' ? (
        <>
          <TableActionsContainer px={1}>
            <TextField
              size="small"
              variant="outlined"
              name="Search"
              value={membersSearch}
              onChange={(e) => setMembersSearch(e.target.value)}
              label="Find member"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {selectedUsers.length > 0 && (
              <ButtonGroup size="small" variant="contained" color="primary">
                <IconButton
                  aria-label="edit"
                  onClick={() =>
                    setOpenEditUser({
                      open: true,
                      multiple: true,
                    })
                  }>
                  <Tooltip title="Edit multiple users">
                    <EditIcon />
                  </Tooltip>
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() =>
                    setOpenDeleteUser({
                      open: true,
                      multiple: true,
                    })
                  }>
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
              onClick={() => setDrawerAddMember(true)}>
              ADD MEMBER
            </Button>
          </TableActionsContainer>
          <TableContainer
            handlePageChange={handleMembersPageChange}
            limit={membersLimit}
            handleLimitChange={handleMembersLimitChange}
            page={membersPage}
            count={membersCount}
            noData={!teamMembers.length ? 'members' : undefined}>
            <AuthUsers
              sort={membersSort}
              setSort={setMembersSort}
              users={teamMembers}
              handleAction={handleMemberAction}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selectedUsers={selectedUsers}
              actions={['edit', 'delete']}
            />
          </TableContainer>
        </>
      ) : (
        <>
          <TableActionsContainer px={1}>
            <TextField
              size="small"
              variant="outlined"
              name="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Find team"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              sx={{ whiteSpace: 'nowrap', ml: 1 }}
              color="primary"
              variant="contained"
              endIcon={<AddCircle />}
              onClick={() => setDrawer(true)}>
              ADD TEAM
            </Button>
          </TableActionsContainer>
          <TableContainer
            handlePageChange={handlePageChange}
            limit={limit}
            handleLimitChange={handleLimitChange}
            page={page}
            count={count}
            noData={!teams.length ? 'teams' : undefined}>
            <AuthTeams
              sort={sort}
              setSort={setSort}
              teams={teams}
              handleAction={handleAction}
              handleRowClick={handleSelectTeam}
            />
          </TableContainer>
        </>
      )}
      <SideDrawerWrapper
        open={drawer}
        maxWidth={550}
        title={teamToEdit ? `Edit team ${teamToEdit._id}` : 'Add a new team'}
        closeDrawer={handleClose}>
        <TeamDrawer
          data={teamToEdit}
          handleSubmit={handleTeamDispatch}
          parentTeam={selectedTeam?.[selectedTeam.length - 1]?._id}
        />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteTeam}
        handleClose={handleClose}
        title={teamToEdit && handleDeleteTeamTitle(teamToEdit)}
        description={teamToEdit && handleDeleteTeamDescription(teamToEdit)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
      <SideDrawerWrapper
        open={drawerAddMember}
        title="Add team members"
        width={'100%'}
        closeDrawer={() => {
          setDrawerAddMember(false);
        }}>
        <AddTeamMemberDrawer handleAddTeamMemberDispatch={handleAddMemberDispatch} />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteUser.open}
        handleClose={handleClose}
        title={handleDeleteTeamMemberTitle(
          openDeleteUser.multiple,
          selectedUser,
          selectedTeam?.[selectedTeam?.length - 1]
        )}
        description={handleDeleteTeamMemberDescription(
          openDeleteUser.multiple,
          selectedUser,
          selectedTeam?.[selectedTeam?.length - 1]
        )}
        buttonAction={deleteMemberButtonAction}
        buttonText={'Delete'}
      />
      <EditTeamMembersDialog
        open={openEditUser.open}
        team={selectedTeam?.[selectedTeam?.length - 1]}
        members={selectedUsers}
        handleClose={handleClose}
        onSubmit={editMemberButtonAction}
      />
    </Box>
  );
};

export default Teams;
