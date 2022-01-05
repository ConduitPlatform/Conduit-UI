import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncGetSchemaDocuments,
} from '../../../redux/slices/cmsSlice';
import { Schema } from '../../../models/cms/CmsModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import SchemaDataCard from './SchemaDataCard';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import SchemaDataHeader from './SchemaDataHeader';
import useParseQuery from './useParseQuery';
import DocumentCreateDialog from './DocumentCreateDialog';
import SchemaDataPlaceholder from './SchemaDataPlaceholder';
import BSONEditor from './BSONEditor';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '80vh',
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
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
    margin: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    position: 'relative',
  },
  cardContainer: {
    overflowY: 'scroll',
    width: '100%',
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

interface Props {
  schemas: Schema[];
}

const SchemaData: FC<Props> = ({ schemas }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { documents, documentsCount } = useAppSelector((state) => state.cmsSlice.data.documents);
  const [documentsState, setDocumentsState] = useState({
    data: [],
    count: 0,
  });
  const [createDialog, setCreateDialog] = useState<boolean>(false);
  const [selectedSchema, setSelectedSchema] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [deleteDocumentDialog, setDeleteDocumentDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 0,
    skip: 0,
    limit: 10,
  });
  const [search, setSearch] = useState<string>('');
  const [objectView, setObjectView] = useState<boolean>(false);

  const debouncedSearch: string = useParseQuery(search, 500);

  const getSchemaDocuments = useCallback(() => {
    if (schemas.length < 1) return;
    if (!schemas[selectedSchema]?.name) return;
    const params = {
      name: schemas[selectedSchema]?.name,
      skip: filters.skip,
      limit: filters.limit,
      query: debouncedSearch ? debouncedSearch : {},
    };
    dispatch(asyncGetSchemaDocuments(params));
  }, [debouncedSearch, dispatch, filters.limit, filters.skip, schemas, selectedSchema]);

  useEffect(() => {
    getSchemaDocuments();
  }, [dispatch, getSchemaDocuments]);

  useEffect(() => {
    setDocumentsState({
      data: documents,
      count: documentsCount,
    });
  }, [documents, documentsCount]);

  const handleChange = (value: number) => {
    setSelectedSchema(value);
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
    const params = {
      schemaName: schemas[selectedSchema].name,
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
    const params = {
      schemaName: schemas[selectedSchema].name,
      document: values,
      getSchemaDocuments: getSchemaDocuments,
    };
    dispatch(asyncCreateSchemaDocument(params));
    setCreateDialog(false);
  };

  const handleClose = () => {
    setCreateDialog(false);
  };

  return (
    <Container>
      <Box className={classes.root}>
        <Tabs
          value={selectedSchema}
          onChange={(event, value) => handleChange(value)}
          orientation="vertical"
          variant="scrollable"
          aria-label="Vertical tabs"
          className={classes.tabs}>
          {schemas.map((d, index) => {
            return <Tab key={`tabs${index}`} label={d.name} />;
          })}
        </Tabs>
        <Box className={classes.headerContainer}>
          <SchemaDataHeader
            onCreateDocument={onCreateDocument}
            onRefresh={getSchemaDocuments}
            filters={filters}
            setFilters={setFilters}
            search={search}
            setSearch={setSearch}
            count={documentsState.count}
            objectView={objectView}
            setObjectView={setObjectView}
          />
          {documentsState.data.length > 0 ? (
            <TabPanel>
              {documentsState.data.map((docs: any, index: number) => {
                return (
                  <BSONEditor value={schemas[selectedSchema]} key={index} />
                  // <SchemaDataCard
                  //   schema={schemas[selectedSchema]}
                  //   documents={docs}
                  //   className={classes.card}
                  //   onDelete={() => onDelete(index)}
                  //   getSchemaDocuments={getSchemaDocuments}
                  //   key={`card${index}`}
                  // />
                );
              })}
            </TabPanel>
          ) : (
            <SchemaDataPlaceholder onCreateDocument={onCreateDocument} />
          )}
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
      <DocumentCreateDialog
        open={createDialog}
        handleCreate={handleCreate}
        handleClose={handleClose}
        schema={schemas[selectedSchema]}
      />
    </Container>
  );
};

export default SchemaData;
