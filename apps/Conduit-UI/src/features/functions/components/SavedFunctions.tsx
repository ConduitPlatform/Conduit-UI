import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { EmailUI, FunctionType } from '../models/FunctionsModels';
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
  ConduitTooltip,
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutline, DeleteTwoTone, InfoOutlined } from '@mui/icons-material';
import { formatData, headers } from './FormatTemplatesHelper';
import TabPanel from './FunctionDrawerContent';
import {
  asyncDeleteFunctions,
  asyncGetSavedFunctions,
  asyncPatchFunction,
  asyncUploadFunction,
} from '../store/functionsSlice';

const SavedFunctions: React.FC = () => {
  const dispatch = useAppDispatch();

  const originalFunctionsTemplate = {
    _id: '',
    name: '',
    functionCode: '',
    inputs: '',
    returns: '',
    timeout: 180000,
  };
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
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionType>(originalFunctionsTemplate);
  const [create, setCreate] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(
      asyncGetSavedFunctions({ skip, limit, search: debouncedSearch, sort: prepareSort(sort) })
    );
  }, [dispatch, limit, skip, debouncedSearch, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const { functions, totalCount } = useAppSelector((state) => state.functionsSlice.data);

  const newTemplate = () => {
    setSelectedTemplate(originalFunctionsTemplate);
    setCreate(true);
    setEdit(true);
    setDrawer(true);
  };

  const saveTemplateChanges = (data: FunctionType) => {
    const _id = data._id;
    const updatedData = {
      name: data.name,
      functionCode: data.functionCode,
      inputs: data.inputs,
      returns: data.returns,
      timeout: data.timeout,
    };
    if (_id !== undefined) {
      dispatch(asyncPatchFunction({ _id, data: updatedData }));
    }
    setSelectedTemplate(updatedData);
  };

  const createNewTemplate = (data: FunctionType) => {
    const newData = {
      name: data.name,
      functionCode: data.functionCode,
      inputs: data.inputs,
      returns: data.returns,
      timeout: data.timeout,
    };
    dispatch(asyncUploadFunction(newData));
    setSelectedTemplate(newData);
    setDrawer(false);
  };

  const handleClose = () => {
    setEdit(false);
    setCreate(false);
    setDrawer(false);
    setSelectedTemplate(originalFunctionsTemplate);
    setSelectedTemplate(originalFunctionsTemplate);
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

  const handleSelectAll = (data: EmailUI[]) => {
    if (selectedTemplates.length === functions.length) {
      setSelectedTemplates([]);
      return;
    }
    const newSelectedTemplates = data.map((item: EmailUI) => item._id);
    setSelectedTemplates(newSelectedTemplates);
  };

  const getTemplatesCallback = useCallback(() => {
    dispatch(asyncGetSavedFunctions({ skip, limit, search }));
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

  const handleAction = (action: { title: string; type: string }, data: EmailUI) => {
    const currentTemplate = functions?.find((func: FunctionType) => func._id === data._id);

    if (currentTemplate !== undefined) {
      if (action.type === 'view') {
        setSelectedTemplate(currentTemplate);
        setEdit(false);
        setDrawer(true);
      }
      if (action.type === 'delete') {
        setSelectedTemplate(currentTemplate);
        setOpenDeleteTemplates(true);
      }
    }
  };

  const handleDeleteTitle = (template: FunctionType) => {
    if (selectedTemplate.name === '') {
      return 'Delete selected functions';
    }
    return `Delete function ${template.name}`;
  };

  const handleDeleteDescription = (template: FunctionType) => {
    if (selectedTemplate.name === '') {
      return 'Are you sure you want to delete the selected functions?';
    }
    return `Are you sure you want to delete ${template.name}? `;
  };

  const deleteButtonAction = () => {
    if (openDeleteTemplates && selectedTemplate.name == '') {
      const params = {
        ids: selectedTemplates,
        getTemplates: getTemplatesCallback,
      };
      dispatch(asyncDeleteFunctions(params));
    } else {
      const params = {
        ids: [`${selectedTemplate._id}`],
        getTemplates: getTemplatesCallback,
      };
      dispatch(asyncDeleteFunctions(params));
    }
    setOpenDeleteTemplates(false);
    setSelectedTemplate(originalFunctionsTemplate);
    setSelectedTemplates([]);
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };
  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toView, toDelete];

  const extractTitle = () => {
    if (!create) {
      return 'Edit your function';
    }

    return 'Create a function';
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
            label="Find function"
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
                  When you need more advanced functionality, you can create your own functions.
                  Functions are written in JavaScript and can utilize the grpc-sdk. They cannot
                  import other npm packages.
                </Typography>
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
              <Tooltip title="Delete multiple functions">
                <DeleteTwoTone />
              </Tooltip>
            </IconButton>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => newTemplate()}>
            New Function
          </Button>
        </Box>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={totalCount}
        noData={functions?.length === 0 ? 'functions' : undefined}>
        <DataTable
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={formatData(functions)}
          actions={actions}
          handleAction={handleAction}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedItems={selectedTemplates}
        />
      </TableContainer>
      <SideDrawerWrapper
        open={drawer}
        title={extractTitle()}
        closeDrawer={() => handleClose()}
        width={750}>
        <TabPanel
          handleCreate={createNewTemplate}
          handleSave={saveTemplateChanges}
          template={selectedTemplate}
          edit={edit}
          setEdit={setEdit}
          create={create}
          setCreate={setCreate}
        />
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteTemplates}
        handleClose={handleClose}
        title={handleDeleteTitle(selectedTemplate)}
        description={handleDeleteDescription(selectedTemplate)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </Box>
  );
};

export default SavedFunctions;
