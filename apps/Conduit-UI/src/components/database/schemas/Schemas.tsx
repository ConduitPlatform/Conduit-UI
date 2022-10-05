import Box from '@mui/material/Box';
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncGetSchemaDocuments,
  asyncGetSchemaOwners,
  asyncGetSystemSchemas,
} from '../../../redux/slices/databaseSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import SchemaDataCard from './SchemaData/SchemaDataCard';
import { ConfirmationDialog, RichTooltip } from '@conduitplatform/ui-components';
import SchemaDataHeader from './SchemaData/SchemaDataHeader';
import useParseQuery from './useParseQuery';
import DocumentCreateDialog from './SchemaData/DocumentCreateDialog';
import SchemaDataPlaceholder from './SchemaData/SchemaDataPlaceholder';
import JSONEditor from './SchemaData/JSONEditor';
import { Grid, InputAdornment, TextField, Typography, Tooltip, Icon, Button } from '@mui/material';
import { Archive, Check, InfoOutlined, Search } from '@mui/icons-material';
import useDebounce from '../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../models/database/CmsModels';
import SchemasList from './SchemasList';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { SchemaTabs } from './SchemaTabs';
import { SchemaOverview } from './SchemaOverview/SchemaOverview';
import NewSchemaDialog from './SchemaOverview/NewSchemaDialog';
import { ConduitMultiSelect } from '@conduitplatform/ui-components';
import InfiniteScrollLayout from '../../InfiniteScrollLayout';

const TabPanel: FC = ({ children }) => {
  return <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>{children}</Box>;
};

interface Filters {
  page: number;
  skip: number;
  limit: number;
}

const Schemas: FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const { schemaModel, schemaDocumentId } = router.query;
  const { schemaOwners } = useAppSelector((state) => state.databaseSlice.data);
  const { documents, documentsCount } = useAppSelector(
    (state) => state.databaseSlice.data.documents
  );
  const { systemSchemas } = useAppSelector((state) => state.databaseSlice.data);
  const [documentsState, setDocumentsState] = useState({
    data: [],
    count: 0,
  });
  const [owners, setOwners] = useState<string[]>(['database']);
  const { schemaDocuments: schemas } = useAppSelector((state) => state.databaseSlice.data.schemas);
  const [createDialog, setCreateDialog] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [deleteDocumentDialog, setDeleteDocumentDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 0,
    skip: 0,
    limit: 25,
  });
  const [search, setSearch] = useState<string>('');
  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
  const [objectView, setObjectView] = useState<boolean>(false);
  const [schemaSearch, setSchemaSearch] = useState<string>('');
  const [actualSchema, setActualSchema] = useState<Schema | undefined>(undefined);
  const [schemaName, setSchemaName] = useState('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [newSchemaDialog, setNewSchemaDialog] = useState(false);
  const debouncedSearch: string = useParseQuery(search, 500);
  const debouncedSchemaSearch: string = useDebounce(schemaSearch, 500);

  useEffect(() => {
    dispatch(asyncGetSchemaOwners());
  }, [dispatch]);

  useEffect(() => {
    dispatch(asyncGetSystemSchemas());
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
      const schemaFound = schemas.find((schema: Schema) => schema.name === schemaName);
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
    router.push(`/database/schemas?schemaModel=${value}`, undefined, { shallow: true });
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

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
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
          sx={{
            background: 'rgba(0,0,0,0.2)',
            margin: 1,
            paddingLeft: 1,
            position: 'relative',
          }}
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
      <Typography sx={{ marginTop: 20 }} variant={'h6'} textAlign={'center'}>
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

  const handleFilterChange = (event: any) => {
    setOwners(event.target.value);
  };

  const handleEnabled = (event: any, newValue: any) => {
    setEnabled(newValue);
    setOwners(['database']);
  };

  const handleAddSchema = () => {
    setNewSchemaDialog(true);
  };

  return (
    <>
      <InfiniteScrollLayout
        listActions={
          <Box>
            <Grid spacing={2} container item>
              <Grid item xs={12}>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
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
                  <Box onMouseOver={MouseOverTooltip} onMouseOut={MouseOutTooltip}>
                    <RichTooltip
                      content={
                        <Box display="flex" flexDirection="column" gap={2} p={2}>
                          <Typography variant="body2">
                            Custom content types are expressed as database schemas. Schemas contain
                            fields of different types. Some of them are optional, while others are
                            required. Some of them might even take a default value if nothing else
                            is explicitly specified.
                          </Typography>
                          <Box display="flex" justifyContent="flex-end">
                            <a
                              href="https://getconduit.dev/docs/modules/database/get-started#documents-example"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}>
                              <Button variant="outlined">Schemas</Button>
                            </a>
                          </Box>
                          <Box display="flex" justifyContent="flex-end">
                            <a
                              href="https://getconduit.dev/docs/modules/database/get-started#documents-example"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}>
                              <Button variant="outlined">Schema Data</Button>
                            </a>
                          </Box>
                        </Box>
                      }
                      width="400px"
                      open={openTooltip}
                      onClose={MouseOutTooltip}>
                      <Icon>
                        <InfoOutlined />
                      </Icon>
                    </RichTooltip>
                  </Box>
                </Box>
              </Grid>
              <Grid container item columnSpacing={9}>
                <Grid item xs={3}>
                  <Box display="flex">
                    <ToggleButtonGroup
                      size="small"
                      value={enabled}
                      exclusive
                      onChange={handleEnabled}>
                      <ToggleButton key={1} value={true}>
                        <Tooltip title="Active Schemas">
                          <Check />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton key={2} value={false}>
                        <Tooltip title="Archived Schemas">
                          <Archive />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
                {enabled && (
                  <Grid item xs={9}>
                    <ConduitMultiSelect
                      formControlProps={{ fullWidth: true }}
                      handleChange={handleFilterChange}
                      label="Owner"
                      options={schemaOwners}
                      values={owners}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>
        }
        list={
          <SchemasList
            handleListItemSelect={handleChange}
            enabled={enabled}
            search={debouncedSchemaSearch}
            owners={owners}
            actualSchema={actualSchema}
          />
        }
        buttonText={'Create schema'}
        infoComponent={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
            <SchemaTabs handleChange={handleTabChange} value={selectedTab} />
            {prepareNavigation()}
            {prepareCardContainer()}
          </Box>
        }
        buttonClick={handleAddSchema}
      />
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
    </>
  );
};

export default Schemas;
