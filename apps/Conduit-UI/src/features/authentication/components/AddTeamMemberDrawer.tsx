import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import addUser from '../../../assets/svgs/addUser.svg';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import { Box } from '@mui/material';
import AuthUsers from '../models/AuthUsers';
import { TableActionsContainer, TableContainer } from '@conduitplatform/ui-components';
import { AuthUserUI } from '../models/AuthModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useDebounce from '../../../hooks/useDebounce';
import { asyncGetAuthUserData } from '../store/authenticationSlice';
import { prepareSort } from '../../../utils/prepareSort';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  handleAddTeamMemberDispatch: (values: { members: string[] }) => void;
}

const AddTeamMemberDrawer: React.FC<Props> = ({ handleAddTeamMemberDispatch }) => {
  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });

  const debouncedSearch: string = useDebounce(search, 500);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const { users, count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);

  useEffect(() => {
    dispatch(
      asyncGetAuthUserData({
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

  const handleSave = () => {
    handleAddTeamMemberDispatch({ members: selectedUsers });
  };

  return (
    <div>
      <Box>
        <TableActionsContainer px={1}>
          <TextField
            size="small"
            variant="outlined"
            name="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Find user"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
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
            handleSelect={handleSelect}
            handleSelectAll={handleSelectAll}
            selectedUsers={selectedUsers}
            actions={[]}
            handleAction={() => undefined}
          />
        </TableContainer>
        <Grid item display={'flex'} justifyContent={'center'}>
          <Button
            onClick={handleSave}
            disabled={selectedUsers.length <= 0}
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}>
            Save
          </Button>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={addUser} width="200px" alt="addUser" />
      </Box>
    </div>
  );
};

export default AddTeamMemberDrawer;
