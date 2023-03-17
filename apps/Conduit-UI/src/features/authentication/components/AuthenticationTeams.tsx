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
import { AuthTeam, AuthTeamFields, AuthTeamUI } from '../models/AuthModels';
import {
  asyncAddNewTeam,
  asyncDeleteTeam,
  asyncEditTeam,
  asyncGetAuthenticationConfig,
  asyncGetAuthTeamData,
} from '../store/authenticationSlice';
import TeamDrawer from './TeamDrawer';
import { handleDeleteDescription, handleDeleteTitle } from './teamDialog';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import TeamPath from './TeamPath';

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
  const [selectedTeam, setSelectedTeam] = useState<AuthTeam[]>();
  const [teamToEdit, setTeamToEdit] = useState<AuthTeam>();
  const [openDeleteTeam, setOpenDeleteTeam] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

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
  }, [selectedTeam]);

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
      setDrawer(true);
      setTeamToEdit(currentTeam);
    } else if (action.type === 'delete') {
      setOpenDeleteTeam(true);
      setTeamToEdit(currentTeam);
    }
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

  return (
    <div>
      <TableActionsContainer>
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
      <TeamPath selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
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
        title={teamToEdit && handleDeleteTitle(teamToEdit)}
        description={teamToEdit && handleDeleteDescription(teamToEdit)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </div>
  );
};

export default Teams;
