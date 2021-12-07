import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import CreateDialog from './DocumentCreateDialog';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncEditSchemaDocument,
  asyncGetSchemaDocuments,
} from '../../../redux/slices/cmsSlice';
import { Schema } from '../../../models/cms/CmsModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import SchemaDataCard from './SchemaDataCard';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import SchemaDataHeader from './SchemaDataHeader';
import SchemaDataPlaceholder from './SchemaDataPlaceholder';
import useParseQuery from './useParseQuery';

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

interface DocumentDialog {
  open: boolean;
  type: 'create' | 'edit';
}

interface Props {
  schemas: Schema[];
}

const initialDocumentDialogState: DocumentDialog = {
  open: false,
  type: 'create',
};

const SchemaData: FC<Props> = ({ schemas }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { documents, documentsCount } = useAppSelector((state) => state.cmsSlice.data.documents);

  const [selectedSchema, setSelectedSchema] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [deleteDocumentDialog, setDeleteDocumentDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState<DocumentDialog>(initialDocumentDialogState);
  const [filters, setFilters] = useState<Filters>({
    page: 0,
    skip: 0,
    limit: 10,
  });
  const [search, setSearch] = useState<string>('');

  const debouncedSearch: string = useParseQuery(search, 500);

  const getSchemaDocuments = useCallback(() => {
    if (schemas.length < 1) return;
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

  const handleChange = (value: number) => {
    setSelectedSchema(value);
  };

  const onEdit = (index: number) => {
    setDocumentDialog({
      open: true,
      type: 'edit',
    });
    setSelectedDocument(documents[index]);
  };

  const handleEditDocument = (schemaName: string, document: any) => {
    const params = {
      schemaName: schemaName,
      documentId: selectedDocument._id,
      documentData: document,
      getSchemaDocuments: getSchemaDocuments,
    };
    dispatch(asyncEditSchemaDocument(params));
    setDocumentDialog(initialDocumentDialogState);
    setSelectedDocument(undefined);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDocumentDialog(false);
    setSelectedDocument(undefined);
  };

  const onDelete = (index: number) => {
    setDeleteDocumentDialog(true);
    setSelectedDocument(documents[index]);
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

  const handleCloseDialog = () => {
    setDocumentDialog(initialDocumentDialogState);
    setSelectedDocument(undefined);
  };

  const onCreateDocument = () => {
    setDocumentDialog({
      open: true,
      type: 'create',
    });
  };

  const handleCreateDocument = (schemaName: string, document: any) => {
    dispatch(asyncCreateSchemaDocument({ schemaName, document, getSchemaDocuments }));
    setDocumentDialog(initialDocumentDialogState);
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
        <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <SchemaDataHeader
            onCreateDocument={onCreateDocument}
            filters={filters}
            setFilters={setFilters}
            search={search}
            setSearch={setSearch}
            count={documentsCount}
          />
          {documents.length > 0 ? (
            <TabPanel>
              {documents.map((docs: any, index: number) => {
                return (
                  <SchemaDataCard
                    schema={schemas[selectedSchema]}
                    documents={docs}
                    className={classes.card}
                    // handleEdit={() => onEdit(index)}
                    onDelete={() => onDelete(index)}
                    key={`card${index}`}
                  />
                );
              })}
            </TabPanel>
          ) : (
            <SchemaDataPlaceholder onCreateDocument={onCreateDocument} />
          )}
        </Box>
      </Box>
      <Dialog
        open={documentDialog.open}
        onClose={handleCloseDialog}
        maxWidth={'md'}
        fullWidth={true}>
        <CreateDialog
          schema={schemas[selectedSchema]}
          handleCreate={handleCreateDocument}
          handleEdit={handleEditDocument}
          // handleCancel={handleCloseDialog}
          editData={selectedDocument}
        />
      </Dialog>
      <ConfirmationDialog
        buttonText="Delete"
        open={deleteDocumentDialog}
        title="Delete document"
        description={`You are about to
        delete document with id:${selectedDocument?._id}`}
        handleClose={handleCloseDeleteDialog}
        buttonAction={handleDelete}
      />
    </Container>
  );
};

export default SchemaData;
