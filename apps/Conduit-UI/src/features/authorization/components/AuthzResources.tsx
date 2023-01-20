import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { prepareSort } from '../../../utils/prepareSort';
import { Box, Button, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import {
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutline, DeleteTwoTone, InfoOutlined } from '@mui/icons-material';
import { formatData, headers } from './FormatResourcesHelper';
import { asyncGetResources } from '../store/authorizationSlice';
import { AuthorizationUI } from '../models/AuthorizationModels';

const AuthzResources: React.FC = () => {
  const dispatch = useAppDispatch();
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [openDeleteTemplates, setOpenDeleteTemplates] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(asyncGetResources({ skip, limit, search: debouncedSearch, sort: prepareSort(sort) }));
  }, [dispatch, limit, skip, debouncedSearch, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const { resources, count } = useAppSelector((state) => state.authorizationSlice.resourceData);

  const handleSelect = (id: string) => {
    const newSelectedTemplates = [...selectedTemplates];

    if (selectedTemplates.includes(id)) {
      const index = newSelectedTemplates.findIndex((newId) => newId === id);
      newSelectedTemplates.splice(index, 1);
    } else {
      newSelectedTemplates.push(id);
    }
    setSelectedTemplates(newSelectedTemplates);
  };

  const handleSelectAll = (data: AuthorizationUI[]) => {
    if (selectedTemplates.length === resources.length) {
      setSelectedTemplates([]);
      return;
    }
    const newSelectedTemplates = data.map((item: AuthorizationUI) => item._id);
    setSelectedTemplates(newSelectedTemplates);
  };

  const getResourcesCallback = useCallback(() => {
    dispatch(asyncGetResources({ skip, limit, search }));
  }, [dispatch, limit, skip, search]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, val: number) => {
    if (val > page) {
      setPage(page + 1);
      setSkip(skip + limit);
    } else {
      setPage(page - 1);
      setSkip(skip - limit);
    }
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toView];

  return (
    <Box>
      <TableActionsContainer>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            variant="outlined"
            name="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Find template"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          {selectedTemplates.length > 0 && (
            <IconButton
              aria-label="delete"
              color="primary"
              onClick={() => setOpenDeleteTemplates(true)}
              size="large">
              <Tooltip title="Delete multiple templates">
                <DeleteTwoTone />
              </Tooltip>
            </IconButton>
          )}
        </Box>
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => setDrawer(true)}>
            New Resource
          </Button>
        </Box>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={resources && resources.length === 0 ? 'resources' : undefined}>
        <DataTable
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={resources ? formatData(resources) : []}
          actions={actions}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedItems={selectedTemplates}
        />
      </TableContainer>
      <SideDrawerWrapper
        open={drawer}
        title={'Create a resource'}
        closeDrawer={() => setDrawer(false)}
        width={750}>
        <Box>placeholder</Box>
      </SideDrawerWrapper>
    </Box>
  );
};

export default AuthzResources;
