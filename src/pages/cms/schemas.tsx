import React, { ReactElement, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import CmsLayout from '../../components/navigation/InnerLayouts/cmsLayout';
import {
  asyncDeleteSelectedSchemas,
  asyncGetCmsSchemas,
  asyncToggleMultipleSchemas,
  asyncToggleSchema,
  setSelectedSchema,
} from '../../redux/slices/cmsSlice';
import { Schema } from '../../models/cms/CmsModels';
import { useRouter } from 'next/router';
import NewSchemaDialog from '../../components/cms/NewSchemaDialog';
import SchemaActionsDialog, { actions } from '../../components/cms/SchemaActionsDialog';
import {
  Grid,
  makeStyles,
  IconButton,
  Tooltip,
  Container,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import useDebounce from '../../hooks/useDebounce';
import DataTable from '../../components/common/DataTable';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { Archive, CheckCircle, Delete, Search } from '@material-ui/icons';
import Paginator from '../../components/common/Paginator';
import { SchemaUI } from '../../components/cms/CmsModels';
import { prepareSort } from '../../utils/prepareSort';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  snackBar: {
    maxWidth: '80%',
    width: 'auto',
  },
  moreButton: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(1),
  },
  paginator: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(0.8),
  },
  toggleButton: {
    '&.Mui-selected': {
      background: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        background: theme.palette.primary.main,
      },
    },
    textTransform: 'none',
  },
  toggleButtonDisabled: {
    '&.Mui-selected': {
      background: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        background: theme.palette.secondary.main,
      },
    },
    textTransform: 'none',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
  },
  create: {
    display: 'flex',
    alignContent: 'end',
    justifyContent: 'flex-end',
  },
  noSchemas: {
    textAlign: 'center',
    marginTop: '200px',
  },
}));

const Schemas = () => {
  const classes = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [selectedSchemaForAction, setSelectedSchemaForAction] = useState<{
    data: any;
    action: actions;
  }>({
    data: {},
    action: '',
  });
  const [selectedSchemas, setSelectedSchemas] = useState<SchemaUI[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const debouncedSearch: string = useDebounce(search, 500);
  const { schemaDocuments, schemasCount } = useAppSelector((state) => state.cmsSlice.data.schemas);

  useEffect(() => {
    dispatch(
      asyncGetCmsSchemas({
        skip,
        limit,
        search: debouncedSearch,
        sort: prepareSort(sort),
        enabled,
      })
    );
  }, [dispatch, skip, limit, debouncedSearch, enabled, sort]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(10);
  }, [debouncedSearch, sort]);

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

  const handleToggleMultiple = () => {
    const ids = selectedSchemaForAction.data.map((schema: Schema) => schema._id);
    dispatch(asyncToggleMultipleSchemas({ ids: ids, enabled: !enabled }));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setSelectedSchemas([]);
    setOpenDialog(false);
  };

  const handleToggleSchema = () => {
    dispatch(asyncToggleSchema(selectedSchemaForAction.data._id));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const handleDeleteSchema = (deleteData: boolean) => {
    dispatch(
      asyncDeleteSelectedSchemas({
        ids: [selectedSchemaForAction.data._id],
        deleteData: deleteData,
      })
    );
    setSelectedSchemaForAction({ data: {}, action: '' });
    setSelectedSchemas([]);
    setOpenDialog(false);
  };

  const handleDeleteMultiple = (deleteData: boolean) => {
    const ids = selectedSchemaForAction.data.map((schema: Schema) => schema._id);
    dispatch(asyncDeleteSelectedSchemas({ ids: ids, deleteData: deleteData }));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const handleChange = (event: any, newValue: any) => {
    setSelectedSchemas([]);
    setEnabled(newValue);
    handleLimitChange(10);
  };

  const enabledActions = [
    { title: 'Edit', type: 'edit' },
    { title: 'Archive', type: 'archive' },
  ];
  const archivedActions = [
    { title: 'Enable', type: 'enable' },
    { title: 'Delete', type: 'delete' },
  ];

  const getActions = () => {
    if (enabled) {
      return enabledActions;
    }
    return archivedActions;
  };

  const handleAdd = () => {
    setOpen(true);
  };

  const handleActions = (action: any, data: any) => {
    switch (action.type) {
      case 'edit':
        dispatch(setSelectedSchema(data._id));
        router.push(
          { pathname: '/cms/build-types', query: { schemaId: data.id ? data.id : null } },
          '/cms/build-types'
        );
        break;
      case 'archive':
        setSelectedSchemaForAction({ data, action: 'archive' });
        setOpenDialog(true);
        break;
      case 'enable':
        setSelectedSchemaForAction({ data, action: 'enable' });
        setOpenDialog(true);
        break;
      case 'delete':
        setSelectedSchemaForAction({ data, action: 'delete' });
        setOpenDialog(true);
        break;
      default:
        break;
    }
  };

  const handleMultipleToggle = () => {
    setSelectedSchemaForAction({
      data: selectedSchemas,
      action: enabled ? 'archiveMany' : 'enableMany',
    });
    setOpenDialog(true);
  };

  const handleMultipleDelete = () => {
    setSelectedSchemaForAction({ data: selectedSchemas, action: 'deleteMany' });
    setOpenDialog(true);
  };

  const handleCloseDisable = () => {
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleSelect = (id: string) => {
    const foundSchema = schemaDocuments?.find((item) => item._id === id);
    const newSelectedElements = [...selectedSchemas];
    const schemaChecked = selectedSchemas.find((schema) => schema?._id === foundSchema?._id);

    if (schemaChecked) {
      const index = newSelectedElements.findIndex((element) => element._id === foundSchema?._id);
      newSelectedElements.splice(index, 1);
    } else {
      foundSchema !== undefined && newSelectedElements.push(foundSchema);
    }
    setSelectedSchemas(newSelectedElements);
  };

  const handleSelectAll = (elements: any) => {
    if (selectedSchemas.length === elements.length) {
      setSelectedSchemas([]);
      return;
    }
    if (schemaDocuments !== null && schemaDocuments !== undefined)
      setSelectedSchemas(schemaDocuments);
  };

  const headers = [
    { title: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Authenticated' },
    { title: 'CRUD' },
    { title: 'Created at', sort: 'createdAt' },
    { title: 'Updated at', sort: 'updatedAt' },
  ];

  const formatSchemas = (schemasToFormat: Schema[]) => {
    if (schemasToFormat !== undefined) {
      return schemasToFormat.map((d) => ({
        _id: d._id,
        name: d.name,
        authentication: d.modelOptions.conduit.cms.authentication,
        crudOperations: d.modelOptions.conduit.cms.crudOperations,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
    }
  };

  return (
    <>
      <Container maxWidth={'xl'}>
        <Grid container>
          <Grid item xs={4}>
            <TextField
              size="small"
              variant="outlined"
              name="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Find schemas"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Box className={classes.toggle}>
              <ToggleButtonGroup value={enabled} exclusive onChange={handleChange}>
                <ToggleButton key={1} value={true} className={classes.toggleButton}>
                  Active Schemas
                </ToggleButton>
                <ToggleButton key={2} value={false} className={classes.toggleButtonDisabled}>
                  Archived Schemas
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box className={classes.create}>
              {selectedSchemas.length > 0 && enabled && (
                <IconButton
                  aria-label="block"
                  color="primary"
                  onClick={() => handleMultipleToggle()}>
                  <Tooltip title="Toggle schemas">
                    <Archive />
                  </Tooltip>
                </IconButton>
              )}
              {selectedSchemas.length > 0 && !enabled && (
                <>
                  <IconButton
                    aria-label="block"
                    color="primary"
                    onClick={() => handleMultipleToggle()}>
                    <Tooltip title="Enable multiple schemas">
                      <CheckCircle />
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    aria-label="block"
                    color="primary"
                    onClick={() => handleMultipleDelete()}>
                    <Tooltip title="Delete multiple schemas">
                      <Delete />
                    </Tooltip>
                  </IconButton>
                </>
              )}
              <Button
                variant="contained"
                color="primary"
                style={{ textTransform: 'capitalize' }}
                onClick={handleAdd}>
                Create new
              </Button>
            </Box>
          </Grid>
        </Grid>
        {schemaDocuments.length > 0 ? (
          <>
            <DataTable
              headers={headers}
              sort={sort}
              setSort={setSort}
              dsData={formatSchemas(schemaDocuments)}
              actions={getActions()}
              selectedItems={selectedSchemas}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              handleAction={handleActions}
            />
            <Grid container className={classes.paginator}>
              <Grid item xs={7} />
              <Grid item xs={5}>
                <Paginator
                  handlePageChange={handlePageChange}
                  limit={limit}
                  handleLimitChange={handleLimitChange}
                  page={page}
                  count={schemasCount}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Box className={classes.noSchemas}>
            <Typography>Oops! There are no schemas</Typography>
          </Box>
        )}
      </Container>
      <NewSchemaDialog open={open} handleClose={handleDialogClose} />
      <SchemaActionsDialog
        open={openDialog}
        handleClose={handleCloseDisable}
        handleToggle={handleToggleSchema}
        handleToggleSchemas={handleToggleMultiple}
        handleDelete={handleDeleteSchema}
        handleDeleteSchemas={handleDeleteMultiple}
        selectedSchema={selectedSchemaForAction}
      />
    </>
  );
};

Schemas.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default Schemas;
