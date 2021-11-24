import React, { ReactElement, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import CmsLayout from '../../components/navigation/InnerLayouts/cmsLayout';
import {
  asyncDeleteSelectedSchema,
  asyncGetCmsSchemas,
  asyncToggleSchema,
  setSelectedSchema,
} from '../../redux/slices/cmsSlice';
import { Schema } from '../../models/cms/CmsModels';
import { useRouter } from 'next/router';
import NewSchemaDialog from '../../components/cms/NewSchemaDialog';
import DisableSchemaDialog from '../../components/cms/DisableSchemaDialog';
import { Grid, makeStyles } from '@material-ui/core';
import useDebounce from '../../hooks/useDebounce';
import DataTable from '../../components/common/DataTable';
import Container from '@material-ui/core/Container';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Box, Button, InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
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
  const [selectedSchemaForAction, setSelectedSchemaForAction] = useState<any>({
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
  const { schemas } = useAppSelector((state) => state.cmsSlice.data);

  useEffect(() => {
    dispatch(
      asyncGetCmsSchemas({
        skip,
        limit,
        search: debouncedSearch,
        sort: prepareSort(sort),
        enabled: enabled,
      })
    );
  }, [dispatch, skip, limit, debouncedSearch, enabled, sort]);

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

  const handleToggleSchema = () => {
    dispatch(asyncToggleSchema(selectedSchemaForAction.data._id));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const handleDeleteSchema = () => {
    dispatch(asyncDeleteSelectedSchema(selectedSchemaForAction.data));
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const enabledActions = [
    { title: 'Edit', type: 'edit' },
    { title: 'Archive', type: 'archive' },
  ];
  const disabledActions = [
    { title: 'Enable', type: 'enable' },
    { title: 'Delete', type: 'delete' },
  ];

  const handleSelect = (id: string) => {
    const foundSchema = schemas?.find((item) => item._id === id);
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

  const handleChange = (event: any, newValue: any) => {
    setEnabled(newValue);
  };

  const getActions = () => {
    if (enabled) {
      return enabledActions;
    }
    return disabledActions;
  };

  const handleSelectAll = (elements: any) => {
    if (selectedSchemas.length === elements.length) {
      setSelectedSchemas([]);
      return;
    }
    if (schemas !== null && schemas !== undefined) setSelectedSchemas(schemas);
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

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Authenticated', sort: 'authenticated' },
    { title: 'CRUD', sort: 'crudOperations' },
    { title: 'Created at', sort: 'createdAt' },
    { title: 'Updated at', sort: 'updatedAt' },
  ];

  const handleCloseDisable = () => {
    setSelectedSchemaForAction({ data: {}, action: '' });
    setOpenDialog(false);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const formatSchemas = (schemas: Schema[]) => {
    if (schemas !== undefined) {
      return schemas.map((d) => ({
        _id: d._id,
        name: d.name,
        crudOperations: d.crudOperations,
        authentication: d.authentication,
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
              label="Find template"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
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
        {schemas.length > 0 && (
          <>
            <DataTable
              headers={headers}
              sort={sort}
              setSort={setSort}
              dsData={formatSchemas(schemas)}
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
                  count={schemas.length}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>

      <NewSchemaDialog open={open} handleClose={handleDialogClose} />
      <DisableSchemaDialog
        open={openDialog}
        handleClose={handleCloseDisable}
        handleToggle={handleToggleSchema}
        handleDelete={handleDeleteSchema}
        selectedSchema={selectedSchemaForAction}
      />
    </>
  );
};

Schemas.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default Schemas;
