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
import { Button } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import AuthTeams from '../models/AuthTeams';
import { AuthTeam, AuthTeamUI } from '../models/AuthModels';
import {
  asyncAddNewTeam,
  asyncDeleteTeam,
  asyncGetAuthenticationConfig,
  asyncGetAuthTeamData,
} from '../store/authenticationSlice';
import AddTeamDrawer from './AddTeamDrawer';
import { handleDeleteDescription, handleDeleteTitle } from './teamDialog';

const Teams: React.FC = () => {
  const dispatch = useAppDispatch();

  const { teams, count } = useAppSelector((state) => state.authenticationSlice.data.authTeams);

  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedTeam, setSelectedTeam] = useState<AuthTeam>();
  const [openDeleteTeam, setOpenDeleteTeam] = useState<boolean>(false);
  const [openEditTeam, setOpenEditTeam] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      asyncGetAuthTeamData({
        skip,
        limit,
        search: debouncedSearch,
        sort: prepareSort(sort),
      })
    );
  }, [dispatch, limit, skip, debouncedSearch, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

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
  const handleAction = (action: { title: string; type: string }, data: AuthTeamUI) => {
    const currentTeam = teams.find((team: AuthTeam) => team._id === data._id) as AuthTeam;
    if (action.type === 'edit') {
      setOpenEditTeam(true);
      setSelectedTeam(currentTeam);
    } else if (action.type === 'delete') {
      setOpenDeleteTeam(true);
      setSelectedTeam(currentTeam);
    }
  };

  const getTeamsCallback = useCallback(() => {
    dispatch(asyncGetAuthTeamData({ skip, limit, search: debouncedSearch }));
  }, [debouncedSearch, dispatch, limit, skip]);

  const handleNewTeamDispatch = (
    values: {
      name: string;
      isDefault: boolean;
    },
    parentTeam?: string
  ) => {
    dispatch(asyncAddNewTeam({ values: { ...values, parentTeam }, getTeams: getTeamsCallback }));
    setDrawer(false);
  };

  const handleClose = () => {
    setOpenDeleteTeam(false);
    setOpenEditTeam(false);
  };

  const deleteButtonAction = () => {
    if (!selectedTeam) return;
    const params = {
      id: `${selectedTeam._id}`,
      getTeams: getTeamsCallback,
    };
    dispatch(asyncDeleteTeam(params));
    setOpenDeleteTeam(false);
    setSelectedTeam(undefined);
  };

  return (
    <div>
      <TableActionsContainer>
        <div />
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
        <AuthTeams sort={sort} setSort={setSort} teams={teams} handleAction={handleAction} />
      </TableContainer>
      <SideDrawerWrapper
        open={drawer}
        maxWidth={550}
        title="Add a new team"
        closeDrawer={() => setDrawer(false)}>
        <AddTeamDrawer
          handleNewTeamDispatch={(values) => handleNewTeamDispatch(values, undefined)}
        />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteTeam}
        handleClose={handleClose}
        title={selectedTeam && handleDeleteTitle(selectedTeam)}
        description={selectedTeam && handleDeleteDescription(selectedTeam)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
      {/*<EditTeamDialog open={openEditTeam} data={selectedTeam} handleClose={handleClose} />*/}
    </div>
  );
};

export default Teams;
