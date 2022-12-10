import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { prepareSort } from '../../../utils/prepareSort';
import {
  Box,
  Button,
  Icon,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataTable,
  TableActionsContainer,
  TableContainer,
  ConduitTooltip,
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
  const [importTemplate, setImportTemplate] = useState<boolean>(false);
  const [create, setCreate] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

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

  const handleClose = () => {
    setImportTemplate(false);
    setEdit(false);
    setCreate(false);
    setDrawer(false);
    setOpenDeleteTemplates(false);
  };

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

  const extractTitle = () => {
    if (!importTemplate && !create) {
      return 'Edit your template';
    }
    if (!importTemplate) {
      return 'Create an email template';
    }
    return 'Import an external template';
  };

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

          <ConduitTooltip
            title={
              <Box display="flex" flexDirection="column" gap={2} p={2}>
                <Typography variant="body2">
                  Most web applications typically require a way to send e-mails to users. The Email
                  module serves this very purpose. Below you can see a brief introduction to some of
                  its features.
                </Typography>
                <Box display="flex" gap={2}>
                  <a
                    href="https://getconduit.dev/docs/modules/email/get-started#templates"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">Templates</Button>
                  </a>
                </Box>
              </Box>
            }>
            <Icon>
              <InfoOutlined />
            </Icon>
          </ConduitTooltip>
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
    </Box>
  );
};

export default AuthzResources;
