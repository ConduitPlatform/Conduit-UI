import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncDeleteSelectedSchemas,
  asyncGetSchemaDocuments,
  asyncGetSchemaOwners,
  asyncToggleSchema,
} from '../../../redux/slices/cmsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import SchemaDataCard from './SchemaDataCard';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import SchemaDataHeader from './SchemaDataHeader';
import useParseQuery from './useParseQuery';
import DocumentCreateDialog from './DocumentCreateDialog';
import SchemaDataPlaceholder from './SchemaDataPlaceholder';
import JSONEditor from './JSONEditor';
import {
  Checkbox,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  OutlinedInput,
  Tooltip,
} from '@material-ui/core';
import { Archive, Check, DoneOutline, Search } from '@material-ui/icons';
import useDebounce from '../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../models/cms/CmsModels';
import SchemasList from './SchemasList';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { SchemaTabs } from './SchemaTabs';
import { SchemaOverview } from './SchemaOverview';
import NewSchemaDialog from '../NewSchemaDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '80vh',
    flexGrow: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    display: 'flex',
  },
  textMargin: {
    marginTop: 64,
  },
  sideBox: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  noContent: {
    textAlign: 'center',
    marginTop: '100px',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minWidth: '300px',
  },
  headerContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    width: '100%',
    paddingBottom: '0',
    marginBottom: '0',
  },
  card: {
    background: 'rgba(0,0,0,0.2)',
    margin: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    position: 'relative',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
  },
  toggleButton: {
    '&.Mui-selected': {
      background: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        background: theme.palette.secondary.contrastText,
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
    marginBottom: theme.spacing(1),
  },
  formControl: {
    minWidth: 120,
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

const TabPanel: FC = ({ children }) => {
  const classes = useStyles();
  return <Box className={classes.cardContainer}>{children}</Box>;
};

interface Filters {
  page: number;
  skip: number;
  limit: number;
}

const Schemas: FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const { schemaModel, schemaDocumentId } = router.query;
  const { schemaOwners } = useAppSelector((state) => state.cmsSlice.data);
  const { documents, documentsCount } = useAppSelector((state) => state.cmsSlice.data.documents);
  const [documentsState, setDocumentsState] = useState({
    data: [],
    count: 0,
  });
  const [owners, setOwners] = useState<string[]>(['cms']);
  const { schemaDocuments: schemas } = useAppSelector((state) => state.cmsSlice.data.schemas);
  const [createDialog, setCreateDialog] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [deleteDocumentDialog, setDeleteDocumentDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 0,
    skip: 0,
    limit: 10,
  });
  const [search, setSearch] = useState<string>('');
  const [objectView, setObjectView] = useState<boolean>(false);
  const [schemaSearch, setSchemaSearch] = useState<string>('');
  const [actualSchema, setActualSchema] = useState<Schema | undefined>(undefined);
  const [schemaName, setSchemaName] = useState('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [newSchemaDialog, setNewSchemaDialog] = useState(false);
  const debouncedSearch: string = useParseQuery(search, 500);
  const debouncedSchemaSearch: string = useDebounce(schemaSearch, 500);
  const labelRef: any = useRef();
  const labelWidth = labelRef.current ? labelRef.current.clientWidth : 0;

  useEffect(() => {
    dispatch(asyncGetSchemaOwners());
  }, [dispatch]);

  useEffect(() => {
    setSchemaName((schemaModel as string) ?? '');
  }, [schemaModel]);

  useEffect(() => {
    if (schemaDocumentId) setSearch(`{"_id": "${schemaDocumentId}"}`);
  }, [schemaDocumentId]);

  useEffect(() => {
    if (schemas.length) {
      if (!schemaName) setActualSchema(undefined);
      const schemaFound = schemas.find((schema) => schema.name === schemaName);
      setActualSchema(schemaFound);
    }
  }, [schemas, schemaName]);

  const getSchemaDocuments = useCallback(() => {
    if (schemas.length < 1) return;
    if (!actualSchema?.name) return;
    const params = {
      name: actualSchema.name,
      skip: filters.skip,
      limit: filters.limit,
      query: debouncedSearch ? debouncedSearch : {},
    };
    dispatch(asyncGetSchemaDocuments(params));
  }, [debouncedSearch, dispatch, filters.limit, filters.skip, schemas, actualSchema]);

  useEffect(() => {
    getSchemaDocuments();
  }, [dispatch, getSchemaDocuments]);

  useEffect(() => {
    if (documents) {
      setDocumentsState({
        data: documents,
        count: documentsCount,
      });
    }
  }, [documents, documentsCount]);

  const handleChange = (value: string) => {
    router.push(`/cms/schemas?schemaModel=${value}`, undefined, { shallow: true });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDocumentDialog(false);
    setSelectedDocument(undefined);
  };

  const onDelete = (index: number) => {
    setDeleteDocumentDialog(true);
    setSelectedDocument(documentsState.data[index]);
  };

  const handleDelete = () => {
    if (!actualSchema) return;
    const params = {
      schemaName: actualSchema.name,
      documentId: selectedDocument._id,
      getSchemaDocuments: getSchemaDocuments,
    };
    dispatch(asyncDeleteSchemaDocument(params));
    handleCloseDeleteDialog();
  };

  const onCreateDocument = () => {
    setCreateDialog(true);
  };

  const handleCreate = (values: any) => {
    if (!actualSchema) return;

    const params = {
      schemaName: actualSchema.name,
      document: values,
      getSchemaDocuments: getSchemaDocuments,
    };
    dispatch(asyncCreateSchemaDocument(params));
    setCreateDialog(false);
  };

  const handleClose = () => {
    setCreateDialog(false);
  };

  const renderMainContent = () => {
    if (!actualSchema) return;

    if (selectedTab === 1) {
      if (objectView) {
        return documentsState.data.map((docs: any, index: number) => (
          <JSONEditor
            documents={docs}
            getSchemaDocuments={getSchemaDocuments}
            schema={actualSchema}
            onDelete={() => onDelete(index)}
            key={index}
          />
        ));
      }
      return documentsState.data.map((docs: any, index: number) => (
        <SchemaDataCard
          schema={actualSchema}
          documents={docs}
          className={classes.card}
          onDelete={() => onDelete(index)}
          getSchemaDocuments={getSchemaDocuments}
          key={`card${index}`}
          id={docs?._id}
        />
      ));
    }
  };

  const handleTabChange = (event: any, newValue: any) => {
    setSelectedTab(newValue);
  };

  const prepareCardContainer = () => {
    if (documentsState.data.length > 0 && actualSchema) {
      if (selectedTab === 1)
        return (
          <Box overflow={'auto'}>
            <TabPanel>{renderMainContent()}</TabPanel>
          </Box>
        );
    }

    if (selectedTab === 0 && actualSchema) {
      return <SchemaOverview schema={actualSchema} />;
    }

    if (actualSchema && selectedTab === 1)
      return <SchemaDataPlaceholder onCreateDocument={onCreateDocument} />;

    return (
      <Typography className={classes.textMargin} variant={'h6'} align={'center'}>
        No selected Schema
      </Typography>
    );
  };

  const prepareNavigation = () => {
    if (selectedTab === 1)
      return (
        <SchemaDataHeader
          onCreateDocument={onCreateDocument}
          onRefresh={getSchemaDocuments}
          filters={filters}
          setFilters={setFilters}
          search={search}
          setSearch={setSearch}
          count={documentsCount}
          objectView={objectView}
          setObjectView={setObjectView}
          disabled={!actualSchema}
        />
      );
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: any }>) => {
    setOwners(event.target.value);
  };

  const handleEnabled = (event: any, newValue: any) => {
    setEnabled(newValue);
    setOwners(['cms']);
  };

  const handleAddSchema = () => {
    setNewSchemaDialog(true);
  };

  return (
    <Container maxWidth={'xl'}>
      <Box className={classes.root}>
        <Box className={classes.sideBox}>
          <Box>
            <Grid style={{ width: '300px' }} spacing={1} container>
              <Grid item xs={12}>
                <TextField
                  size="small"
                  variant="outlined"
                  name="Search"
                  value={schemaSearch}
                  onChange={(e) => setSchemaSearch(e.target.value)}
                  label="Find schema"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid container item style={{ paddingBottom: '10px' }}>
                <Grid item xs={4}>
                  <Box display="flex">
                    <ToggleButtonGroup
                      size="small"
                      value={enabled}
                      exclusive
                      onChange={handleEnabled}>
                      <ToggleButton key={1} value={true} className={classes.toggleButton}>
                        <Tooltip title="Active Schemas">
                          <Check />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton key={2} value={false} className={classes.toggleButtonDisabled}>
                        <Tooltip title="Archived Schemas">
                          <Archive />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
                {enabled && (
                  <Grid item xs={8}>
                    <FormControl size="small" variant="outlined" fullWidth>
                      <InputLabel
                        ref={labelRef}
                        shrink
                        htmlFor="my-input"
                        id="multiple-select-label">
                        Owner
                      </InputLabel>
                      <Select
                        labelId="multiple-select-label"
                        id="filters"
                        multiple
                        value={owners}
                        onChange={handleFilterChange}
                        input={<OutlinedInput labelWidth={labelWidth} id="my-input" />}
                        renderValue={(selected: any) =>
                          selected.length === 1 ? selected : 'multiple'
                        }
                        MenuProps={{
                          getContentAnchorEl: null,
                        }}>
                        {schemaOwners &&
                          schemaOwners.map((module: any) => (
                            <MenuItem key={module} value={module}>
                              <Checkbox checked={owners.indexOf(module) > -1} />
                              <ListItemText primary={module} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box height="70vh" width="auto">
            <SchemasList
              handleListItemSelect={handleChange}
              enabled={enabled}
              search={debouncedSchemaSearch}
              owners={owners}
              actualSchema={actualSchema}
            />
          </Box>
          <Box padding="10px">
            <Button fullWidth variant="contained" color="secondary" onClick={handleAddSchema}>
              Create schema
            </Button>
          </Box>
        </Box>
        <Box className={classes.headerContainer}>
          <SchemaTabs handleChange={handleTabChange} value={selectedTab} />
          {prepareNavigation()}
          {prepareCardContainer()}
        </Box>
      </Box>
      <ConfirmationDialog
        buttonText="Delete"
        open={deleteDocumentDialog}
        title="Delete document"
        description={`You are about to
        delete document with id:${selectedDocument?._id}`}
        handleClose={handleCloseDeleteDialog}
        buttonAction={handleDelete}
      />
      {actualSchema && (
        <DocumentCreateDialog
          open={createDialog}
          handleCreate={handleCreate}
          handleClose={handleClose}
          schema={actualSchema}
        />
      )}
      <NewSchemaDialog open={newSchemaDialog} handleClose={() => setNewSchemaDialog(false)} />
    </Container>
  );
};

export default Schemas;
