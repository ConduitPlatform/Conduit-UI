import { useAppDispatch, useAppSelector } from '../../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { FormsModel, FormsUI } from '../models/FormsModels';
import useDebounce from '../../../hooks/useDebounce';
import {
  asyncCreateForm,
  asyncDeleteForms,
  asyncEditForm,
  asyncGetForms,
} from '../store/formsSlice';
import { prepareSort } from '../../../utils/prepareSort';
import {
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
} from '@conduitplatform/ui-components';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutline, DeleteTwoTone } from '@mui/icons-material';
import ViewEditForm from './FormDrawerContent';
import FormReplies from './FormReplies';

const FormsView: React.FC = () => {
  const dispatch = useAppDispatch();

  const emptyFormState = {
    _id: '',
    name: '',
    fields: {},
    forwardTo: '',
    emailField: '',
    enabled: false,
  };
  const [skip, setSkip] = useState<number>(0);
  const [openDeleteForms, setOpenDeleteForms] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<FormsModel>(emptyFormState);
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [limit, setLimit] = useState<number>(25);
  const [page, setPage] = useState<number>(0);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [create, setCreate] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [repliesForm, setRepliesForm] = useState<FormsModel>(emptyFormState);

  const debouncedSearch: string = useDebounce(search, 500);

  const { forms, count } = useAppSelector((state) => state.formsSlice.data);

  useEffect(() => {
    dispatch(asyncGetForms({ skip, limit, search: debouncedSearch, sort: prepareSort(sort) }));
  }, [dispatch, skip, limit, debouncedSearch, sort]);

  const getFormsCallback = useCallback(() => {
    dispatch(asyncGetForms({ skip, limit, search: debouncedSearch }));
  }, [dispatch, limit, skip, debouncedSearch]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const newForm = () => {
    setDrawer(true);
    setCreate(true);
    setEdit(true);
  };

  const handleCloseDrawer = () => {
    setDrawer(false);
    setCreate(false);
    setEdit(false);
    setRepliesForm(emptyFormState);

    setSelectedForm(emptyFormState);
    setOpenDeleteForms(false);
  };

  const saveFormChanges = (data: FormsModel) => {
    const _id = data._id;
    const updatedData = {
      _id: data._id,
      name: data.name,
      fields: data.fields,
      forwardTo: data.forwardTo,
      emailField: data.emailField,
      enabled: data.enabled,
    };
    if (_id !== undefined) {
      dispatch(asyncEditForm({ _id, data: updatedData }));
    }
    setSelectedForm(updatedData);
  };

  const createNewForm = (data: FormsModel) => {
    setDrawer(false);
    const newData = {
      name: data.name,
      fields: data.fields,
      forwardTo: data.forwardTo,
      emailField: data.emailField,
      enabled: data.enabled,
    };
    dispatch(asyncCreateForm(newData));
    setSelectedForm(newData);
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
    const newSelectedForms = [...selectedForms];

    if (selectedForms.includes(id)) {
      const index = newSelectedForms.findIndex((newId) => newId === id);
      newSelectedForms.splice(index, 1);
    } else {
      newSelectedForms.push(id);
    }
    setSelectedForms(newSelectedForms);
  };

  const handleSelectAll = (data: FormsUI[]) => {
    if (selectedForms.length === forms.length) {
      setSelectedForms([]);
      return;
    }
    const newSelectedForms = data.map((item: FormsUI) => item._id);
    setSelectedForms(newSelectedForms);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  const handleAction = (action: { title: string; type: string }, data: any) => {
    const currentForm = forms?.find((form: FormsModel) => form._id === data._id);
    if (currentForm !== undefined) {
      if (action.type === 'view') {
        setDrawer(true);
        setEdit(false);
        setSelectedForm(currentForm);
      }
      if (action.type === 'replies') {
        setRepliesForm(currentForm);
        setDrawer(true);
      }
      if (action.type === 'delete') {
        setSelectedForm(currentForm);
        setOpenDeleteForms(true);
      }
    }
  };

  const deleteButtonAction = () => {
    if (openDeleteForms && selectedForm.name === '') {
      const params = {
        ids: selectedForms,
        getForms: getFormsCallback,
      };
      dispatch(asyncDeleteForms(params));
    } else {
      const params = {
        ids: [`${selectedForm._id}`],
        getForms: getFormsCallback,
      };
      dispatch(asyncDeleteForms(params));
    }
    setOpenDeleteForms(false);
    setSelectedForm(emptyFormState);
    setSelectedForms([]);
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toReplies = {
    title: 'Form replies',
    type: 'replies',
  };

  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toReplies, toView, toDelete];

  const handleDeleteTitle = (form: FormsModel) => {
    if (selectedForm.name === '') {
      return 'Delete selected forms';
    }
    return `Delete form ${form.name}`;
  };

  const handleDeleteDescription = (form: FormsModel) => {
    if (selectedForm.name === '') {
      return 'Are you sure you want to delete the selected forms?';
    }
    return `Are you sure you want to delete ${form.name}? `;
  };

  const formatData = (data: FormsModel[]) => {
    return data.map((u) => {
      return {
        _id: u._id,
        Name: u.name,
        forwardTo: u.forwardTo,
        Enabled: u.enabled,
      };
    });
  };

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Forward to', sort: 'forwardTo' },
    { title: 'Enabled', sort: 'enabled' },
  ];

  return (
    <div>
      <TableActionsContainer>
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
        <Box display="flex" alignItems="center" gap={2}>
          {selectedForms.length > 0 && (
            <IconButton
              aria-label="delete"
              color="primary"
              onClick={() => setOpenDeleteForms(true)}
              size="large">
              <Tooltip title="Delete multiple forms">
                <DeleteTwoTone />
              </Tooltip>
            </IconButton>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => newForm()}>
            Add new form
          </Button>
        </Box>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={count}
        noData={!forms.length ? 'forms' : undefined}>
        <DataTable
          headers={headers}
          sort={sort}
          setSort={setSort}
          dsData={formatData(forms)}
          actions={actions}
          handleAction={handleAction}
          handleSelect={handleSelect}
          handleSelectAll={handleSelectAll}
          selectedItems={selectedForms}
        />
      </TableContainer>
      <SideDrawerWrapper
        title={create ? 'Create a new form' : 'Edit form'}
        open={drawer}
        closeDrawer={() => handleCloseDrawer()}
        width={700}>
        {repliesForm.name === '' ? (
          <>
            <ViewEditForm
              handleCreate={createNewForm}
              handleSave={saveFormChanges}
              form={selectedForm}
              edit={edit}
              create={create}
              setEdit={setEdit}
              setCreate={setCreate}
            />
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              color="primary"
              style={{ marginTop: '30px', textAlign: 'center' }}>
              Viewing form replies from {repliesForm.name}
            </Typography>
            <FormReplies repliesForm={repliesForm} />
          </>
        )}
      </SideDrawerWrapper>
      <ConfirmationDialog
        open={openDeleteForms}
        handleClose={handleCloseDrawer}
        title={handleDeleteTitle(selectedForm)}
        description={handleDeleteDescription(selectedForm)}
        buttonAction={deleteButtonAction}
        buttonText={'Delete'}
      />
    </div>
  );
};

export default FormsView;
