import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncGetCmsSchemas,
  asyncGetSchemaDocuments,
} from '../../../redux/slices/cmsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import SchemaDataCard from './SchemaDataCard';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import SchemaDataHeader from './SchemaDataHeader';
import useParseQuery from './useParseQuery';
import DocumentCreateDialog from './DocumentCreateDialog';
import SchemaDataPlaceholder from './SchemaDataPlaceholder';
import JSONEditor from './JSONEditor';
import { InputAdornment, TextField, Typography } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import useDebounce from '../../../hooks/useDebounce';
import { useRouter } from 'next/router';
import { Schema } from '../../../models/cms/CmsModels';

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
    padding: theme.spacing(1),
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
    flexDirection: 'column',
    width: '100%',
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

const SchemaData: FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { schemaModel, schemaDocumentId } = router.query;
  const { documents, documentsCount } = useAppSelector((state) => state.cmsSlice.data.documents);
  const [documentsState, setDocumentsState] = useState({
    data: [],
    count: 0,
  });
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
  const debouncedSearch: string = useParseQuery(search, 500);
  const debouncedSchemaSearch: string = useDebounce(schemaSearch, 500);

  useEffect(() => {
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 200, search: debouncedSchemaSearch }));
  }, [dispatch, debouncedSchemaSearch]);

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
    router.push(`/cms/schemadata?schemaModel=${value}`, undefined, { shallow: true });
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
  };

  const prepareCardContainer = () => {
    if (documentsState.data.length > 0 && actualSchema) {
      return (
        <Box overflow={'auto'}>
          <TabPanel>{renderMainContent()}</TabPanel>
        </Box>
      );
    }

    if (actualSchema) return <SchemaDataPlaceholder onCreateDocument={onCreateDocument} />;

    return (
      <Typography className={classes.textMargin} variant={'h6'} align={'center'}>
        No selected Schema
      </Typography>
    );
  };

  return (
    <Container maxWidth={'xl'}>
      <Box className={classes.root}>
        <Box className={classes.sideBox}>
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
          {schemas.length > 0 && (
            <Tabs
              value={schemaName}
              onChange={(event, value) => handleChange(value)}
              orientation="vertical"
              variant="scrollable"
              aria-label="Vertical tabs"
              className={classes.tabs}>
              {schemas.map((d, index) => {
                return <Tab key={`tabs${index}`} label={d.name} value={d.name} />;
              })}
            </Tabs>
          )}
          {!schemas.length && (
            <Box className={classes.tabs}>
              <Typography className={classes.noContent}>No available schemas</Typography>
            </Box>
          )}
        </Box>
        <Box className={classes.headerContainer}>
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
    </Container>
  );
};

export default SchemaData;
