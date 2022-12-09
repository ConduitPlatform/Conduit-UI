import { useAppDispatch, useAppSelector } from '../../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { EmailTemplateType, EmailUI } from './EmailModels';
import useDebounce from '../../hooks/useDebounce';
import {
  asyncCreateNewEmailTemplate,
  asyncDeleteTemplates,
  asyncGetEmailTemplates,
  asyncSaveEmailTemplateChanges,
  asyncSyncTemplates,
  asyncUploadTemplate,
} from './emailsSlice';
import { prepareSort } from '../../utils/prepareSort';
import { enqueueInfoNotification } from '../../hooks/useNotifier';
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
  ConfirmationDialog,
  DataTable,
  SideDrawerWrapper,
  TableActionsContainer,
  TableContainer,
  ConduitTooltip,
} from '@conduitplatform/ui-components';
import SearchIcon from '@mui/icons-material/Search';
import {
  AddCircleOutline,
  CallMissedOutgoing,
  DeleteTwoTone,
  InfoOutlined,
} from '@mui/icons-material';
import Sync from '@mui/icons-material/Sync';
import { formatData, headers } from './FormatTemplatesHelper';
import TabPanel from './EmailDrawerContent';
import ExternalTemplates from './ExternalTemplates';

const EmailTemplates: React.FC = () => {
  const dispatch = useAppDispatch();

  const originalTemplateState = {
    _id: '',
    name: '',
    subject: '',
    body: '',
    variables: [],
    sender: '',
    externalManaged: false,
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplateType>(originalTemplateState);
  const [importTemplate, setImportTemplate] = useState<boolean>(false);
  const [create, setCreate] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    dispatch(
      asyncGetEmailTemplates({ skip, limit, search: debouncedSearch, sort: prepareSort(sort) })
    );
  }, [dispatch, limit, skip, debouncedSearch, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const { templateDocuments, totalCount } = useAppSelector((state) => state.emailsSlice.data);

  const newTemplate = () => {
    setImportTemplate(false);
    setSelectedTemplate(originalTemplateState);
    setCreate(true);
    setEdit(true);
    setDrawer(true);
  };

  const handleImportTemplate = () => {
    setImportTemplate(true);
    setDrawer(true);
  };

  const saveTemplateChanges = (data: EmailTemplateType) => {
    const _id = data._id;
    const updatedData = {
      name: data.name,
      subject: data.subject,
      sender: data.sender !== '' ? data.sender : undefined,
      body: data.body,
      variables: data.variables,
      externalManaged: data.externalManaged,
    };
    if (_id !== undefined) {
      dispatch(asyncSaveEmailTemplateChanges({ _id, data: updatedData }));
    }
    setSelectedTemplate(updatedData);
  };

  const createNewTemplate = (data: EmailTemplateType) => {
    const newData = {
      name: data.name,
      subject: data.subject,
      sender: data.sender,
      body: data.body,
      externalManaged: data.externalManaged,
      variables: data.variables,
      _id: data._id,
    };
    dispatch(asyncCreateNewEmailTemplate(newData));
    setSelectedTemplate(newData);
    setDrawer(false);
  };

  const handleClose = () => {
    setImportTemplate(false);
    setEdit(false);
    setCreate(false);
    setDrawer(false);
    setSelectedTemplate(originalTemplateState);
    setSelectedTemplate(originalTemplateState);
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
    if (selectedTemplates.length === templateDocuments.length) {
      setSelectedTemplates([]);
      return;
    }
    const newSelectedTemplates = data.map((item: EmailUI) => item._id);
    setSelectedTemplates(newSelectedTemplates);
  };

  const getTemplatesCallback = useCallback(() => {
    dispatch(asyncGetEmailTemplates({ skip, limit, search }));
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
    const currentTemplate = templateDocuments?.find(
      (template: EmailTemplateType) => template._id === data._id
    );

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
      if (action.type === 'upload') {
        if (currentTemplate.externalManaged) {
          dispatch(enqueueInfoNotification('The selected template is already uploaded'));
          return;
        }

        if (currentTemplate._id !== undefined) {
          dispatch(asyncUploadTemplate(currentTemplate._id));
        }
      }
    }
  };

  const handleDeleteTitle = (template: EmailTemplateType) => {
    if (selectedTemplate.name === '') {
      return 'Delete selected templates';
    }
    return `Delete template ${template.name}`;
  };

  const handleDeleteDescription = (template: EmailTemplateType) => {
    if (selectedTemplate.name === '') {
      return 'Are you sure you want to delete the selected templates?';
    }
    return `Are you sure you want to delete ${template.name}? `;
  };

  const deleteButtonAction = () => {
    if (openDeleteTemplates && selectedTemplate.name == '') {
      const params = {
        ids: selectedTemplates,
        getTemplates: getTemplatesCallback,
      };
      dispatch(asyncDeleteTemplates(params));
    } else {
      const params = {
        ids: [`${selectedTemplate._id}`],
        getTemplates: getTemplatesCallback,
      };
      dispatch(asyncDeleteTemplates(params));
    }
    setOpenDeleteTemplates(false);
    setSelectedTemplate(originalTemplateState);
    setSelectedTemplates([]);
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toUpload = {
    title: 'Upload',
    type: 'upload',
  };

  const toView = {
    title: 'View',
    type: 'view',
  };

  const actions = [toUpload, toView, toDelete];

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
                  <a
                    href="https://getconduit.dev/docs/modules/email/get-started#import-a-template"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">Import a template</Button>
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
          <IconButton color="primary" onClick={() => dispatch(asyncSyncTemplates())} size="small">
            <Tooltip title="Sync external templates">
              <Sync color="primary" />
            </Tooltip>
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleImportTemplate()}
            startIcon={<CallMissedOutgoing />}>
            Import Template
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => newTemplate()}>
            New Template
          </Button>
        </Box>
      </TableActionsContainer>
      <TableContainer
        handlePageChange={handlePageChange}
        limit={limit}
        handleLimitChange={handleLimitChange}
        page={page}
        count={totalCount}
        noData={templateDocuments?.length === 0 ? 'templates' : undefined}>
        <DataTable
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={formatData(templateDocuments)}
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
        {!importTemplate ? (
          <TabPanel
            handleCreate={createNewTemplate}
            handleSave={saveTemplateChanges}
            template={selectedTemplate}
            edit={edit}
            setEdit={setEdit}
            create={create}
            setCreate={setCreate}
          />
        ) : (
          <ExternalTemplates handleSave={createNewTemplate} />
        )}
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

export default EmailTemplates;
