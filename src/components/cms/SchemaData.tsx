import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import React, { FC, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import CreateDialog from './DocumentCreateDialog';
import {
  asyncCreateSchemaDocument,
  asyncDeleteSchemaDocument,
  asyncEditSchemaDocument,
} from '../../redux/slices/cmsSlice';
import { Schema } from '../../models/cms/CmsModels';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import TextField from '@material-ui/core/TextField';
import Paginator from '../common/Paginator';
import RefreshIcon from '@material-ui/icons/Refresh';
import SchemaDataCard from './SchemaDataCard';
import ConfirmationDialog from '../common/ConfirmationDialog';

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
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  grid: {
    marginBottom: theme.spacing(3),
  },
  multiline: {
    width: '100%',
  },
  textField: {
    width: '95%',
  },
  tree: {
    flexGrow: 1,
    maxWidth: 400,
  },
  'Mui-selected': {
    background: 'none',
    '&:hover': {
      background: 'none !important',
    },
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
  emptyDocuments: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  addDocBox: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const TabPanel: FC = ({ children }) => {
  const classes = useStyles();
  return <Box className={classes.cardContainer}>{children}</Box>;
};

interface DocumentDialog {
  open: boolean;
  type: 'create' | 'edit';
}

interface Props {
  schemas: Schema[];
  handleSchemaChange: any;
}

const initialDocumentDialogState: DocumentDialog = {
  open: false,
  type: 'create',
};

const SchemaData: FC<Props> = ({ schemas, handleSchemaChange }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { documents } = useAppSelector((state) => state.cmsSlice?.data.documents);

  const [selectedSchema, setSelectedSchema] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [deleteDocumentDialog, setDeleteDocumentDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState<DocumentDialog>(initialDocumentDialogState);

  const handleChange = (value: number) => {
    setSelectedSchema(value);
    const name = schemas[value].name;
    handleSchemaChange(name);
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
    dispatch(asyncCreateSchemaDocument({ schemaName, document }));
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
          <Box
            style={{
              display: 'flex',
              padding: 8,
              paddingBottom: 0,
              justifyContent: 'space-between',
            }}>
            <TextField label="Search" variant="outlined" style={{ flex: 1 }} />
            <Box style={{ width: 8 }} />
            <Button variant="contained" color="secondary" onClick={() => console.log('refresh')}>
              <RefreshIcon />
              Refresh
            </Button>
            <Box style={{ width: 8 }} />
            <Button variant="contained" color="primary" onClick={() => onCreateDocument()}>
              Add Document
            </Button>
          </Box>
          <Paginator
            handlePageChange={() => console.log('handlePageChange')}
            limit={25}
            handleLimitChange={() => console.log('handleLimitChange')}
            page={0}
            count={5}
            style={{ borderBottom: '1px solid rgb(255 255 255 / 12%)' }}
          />

          {documents.length > 0 ? (
            <TabPanel>
              {documents.map((docs: any, index: number) => {
                return (
                  <SchemaDataCard
                    documents={docs}
                    className={classes.card}
                    handleEdit={() => onEdit(index)}
                    handleDelete={() => onDelete(index)}
                    key={`card${index}`}
                  />
                );
              })}
            </TabPanel>
          ) : (
            <Box className={classes.emptyDocuments}>
              <p>No documents are available.</p>
              <Button variant="contained" color="primary" onClick={() => onCreateDocument()}>
                Add Document
              </Button>
            </Box>
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
          handleCancel={handleCloseDialog}
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
