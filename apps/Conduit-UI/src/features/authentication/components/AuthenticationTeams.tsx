import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useDebounce from '../../../hooks/useDebounce';
import { isString } from 'lodash';
import { prepareSort } from '../../../utils/prepareSort';
import {
  ConfirmationDialog,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import SearchFilter from './SearchFilter';
import { Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddCircle } from '@mui/icons-material';
import AuthTeams from '../models/AuthTeams';
import { AuthTeam, AuthTeamUI } from '../models/AuthModels';
import { asyncGetAuthenticationConfig } from '../store/authenticationSlice';

const Teams: React.FC = () => {
  const dispatch = useAppDispatch();

  const { teams, count } = useAppSelector((state) => state.authenticationSlice.data.authTeams);

  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedTeam, setSelectedTeam] = useState<AuthTeam>({
    createdAt: '',
    updatedAt: '',
    name: '',
    isDefault: false,
    _id: '',
  });
  const [openBlockUI, setOpenBlockUI] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [openDeleteTeam, setOpenDeleteTeam] = useState<{ open: boolean; multiple: boolean }>({
    open: false,
    multiple: false,
  });
  const [openEditTeam, setOpenEditTeam] = useState<boolean>(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
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
    // dispatch(
    //   asyncGetAuthTeamData({
    //     skip,
    //     limit,
    //     search: debouncedSearch,
    //     provider: filter,
    //     sort: prepareSort(sort),
    //   })
    // );
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
    const newSelectedTeams = [...selectedTeams];
    if (selectedTeams.includes(id)) {
      const index = newSelectedTeams.findIndex((newId) => newId === id);
      newSelectedTeams.splice(index, 1);
    } else {
      newSelectedTeams.push(id);
    }
    setSelectedTeams(newSelectedTeams);
  };

  const handleSelectAll = (data: AuthTeamUI[]) => {
    if (selectedTeams.length === teams.length) {
      setSelectedTeams([]);
      return;
    }
    const newSelectedTeams = data.map((item: AuthTeamUI) => item._id);
    setSelectedTeams(newSelectedTeams);
  };

  const handleAction = (action: { title: string; type: string }, data: AuthTeamUI) => {
    const currentTeam = teams.find((team: AuthTeam) => team._id === data._id) as AuthTeam;
    if (action.type === 'edit') {
      setOpenEditTeam(true);
      setSelectedTeam(currentTeam);
    } else if (action.type === 'delete') {
      setOpenDeleteTeam({
        open: true,
        multiple: false,
      });
      setSelectedTeam(currentTeam);
    } else if (action.type === 'block/unblock') {
      setOpenBlockUI({
        open: true,
        multiple: false,
      });
      setSelectedTeam(currentTeam);
    }
  };

  const getTeamsCallback = useCallback(() => {
    // dispatch(asyncGetAuthTeamData({ skip, limit, search: debouncedSearch, provider: filter }));
  }, [debouncedSearch, dispatch, filter, limit, skip]);

  const handleNewTeamDispatch = (values: { password: string; email: string }) => {
    // dispatch(asyncAddNewTeam({ values, getTeams: getTeamsCallback }));
    setDrawer(false);
  };

  // const handleBlock = () => {
  //   if (openBlockUI.multiple) {
  //     const selectedTeamsObj: boolean[] = [];
  //     teams.forEach((team: AuthTeam) => {
  //       if (selectedTeams.includes(team._id)) {
  //         selectedTeamsObj.push(team.active);
  //       }
  //     });
  //     const isActive = selectedTeamsObj.some((active) => active);
  //     const params = {
  //       body: {
  //         ids: selectedTeams,
  //         block: !isActive,
  //       },
  //       getTeams: getTeamsCallback,
  //     };
  //     dispatch(asyncBlockUnblockTeams(params));
  //     setOpenBlockUI({
  //       open: false,
  //       multiple: false,
  //     });
  //     return;
  //   }
  //   if (selectedTeam.active) {
  //     dispatch(asyncBlockTeamUI(selectedTeam._id));
  //   } else {
  //     dispatch(asyncUnblockTeamUI(selectedTeam._id));
  //   }
  //   setOpenBlockUI({
  //     open: false,
  //     multiple: false,
  //   });
  // };

  const handleClose = () => {
    setOpenDeleteTeam({
      open: false,
      multiple: false,
    });
    setOpenBlockUI({
      open: false,
      multiple: false,
    });
    setOpenEditTeam(false);
  };

  // const deleteButtonAction = () => {
  //   if (openDeleteTeam.open && openDeleteTeam.multiple) {
  //     const params = {
  //       ids: selectedTeams,
  //       getTeams: getTeamsCallback,
  //     };
  //     dispatch(asyncDeleteTeams(params));
  //   } else {
  //     const params = {
  //       ids: [`${selectedTeam._id}`],
  //       getTeams: getTeamsCallback,
  //     };
  //     dispatch(asyncDeleteTeams(params));
  //   }
  //   setOpenDeleteTeam({
  //     open: false,
  //     multiple: false,
  //   });
  //   setSelectedTeams([]);
  // };

  return (
    <div>
      <TableActionsContainer>
        <SearchFilter
          setSearch={setSearch}
          search={search}
          filter={filter}
          handleFilterChange={handleFilterChange}
        />
        {selectedTeams.length > 1 && (
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
              <Tooltip title="Block multiple teams">
                <BlockIcon />
              </Tooltip>
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() =>
                setOpenDeleteTeam({
                  open: true,
                  multiple: true,
                })
              }
              size="large">
              <Tooltip title="Delete multiple teams">
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
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedTeams={selectedTeams}
        />
      </TableContainer>
      <SideDrawerWrapper
        open={drawer}
        maxWidth={550}
        title="Add a new team"
        closeDrawer={() => {
          setDrawer(false);
        }}>
        {/*<NewTeamModal handleNewTeamDispatch={handleNewTeamDispatch} />*/}
      </SideDrawerWrapper>
      {/*<ConfirmationDialog*/}
      {/*  open={openDeleteTeam.open}*/}
      {/*  handleClose={handleClose}*/}
      {/*  title={handleDeleteTitle(openDeleteTeam.multiple, selectedTeam)}*/}
      {/*  description={handleDeleteDescription(openDeleteTeam.multiple, selectedTeam)}*/}
      {/*  buttonAction={deleteButtonAction}*/}
      {/*  buttonText={'Delete'}*/}
      {/*/>*/}
      {/*<ConfirmationDialog*/}
      {/*  open={openBlockUI.open}*/}
      {/*  handleClose={handleClose}*/}
      {/*  title={handleBlockTitle(openBlockUI.multiple, selectedTeam)}*/}
      {/*  description={handleBlockDescription(openBlockUI.multiple, selectedTeam)}*/}
      {/*  buttonAction={handleBlock}*/}
      {/*  buttonText={handleBlockButton(openBlockUI.multiple, selectedTeam)}*/}
      {/*/>*/}
      {/*<EditTeamDialog open={openEditTeam} data={selectedTeam} handleClose={handleClose} />*/}
    </div>
  );
};

export default Teams;
