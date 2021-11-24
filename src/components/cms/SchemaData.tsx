import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import React, { FC, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { KeyboardArrowDown } from '@material-ui/icons';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import CardContent from '@material-ui/core/CardContent';
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
  bold: {
    fontWeight: 'bold',
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

interface TreeItemLabelProps {
  docItem: DocItem;
}

const TreeItemLabel: FC<TreeItemLabelProps> = ({ docItem }) => {
  const classes = useStyles();
  return (
    <Typography variant={'subtitle2'}>
      <Typography component={'span'} className={classes.bold}>{`${docItem.id}: `}</Typography>
      {Array.isArray(docItem.data)
        ? docItem.data.length > 0
          ? '[...]'
          : '[ ]'
        : typeof docItem.data !== 'string' && docItem.data && Object.keys(docItem.data).length > 0
        ? '{...}'
        : `${docItem.data}`}
    </Typography>
  );
};

const createDocumentArray = (document: any) => {
  return Object.keys(document).map((key) => {
    return { id: key, data: document[key] };
  });
};

interface DocItem {
  id: string;
  data: any;
}

interface Props {
  schemas: Schema[];
  handleSchemaChange: any;
}

const SchemaData: FC<Props> = ({ schemas, handleSchemaChange }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { documents } = useAppSelector((state) => state.cmsSlice?.data.documents);

  const [selectedSchema, setSelectedSchema] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [docIndex, setDocIndex] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDocument, setCreateDocument] = useState(false);

  const handleCreateDialog = (create: boolean) => {
    if (!create) {
      setSelectedDocument(null);
    }
    setCreateDocument(!createDocument);
  };

  const handleConfirmationDialogClose = () => {
    setDeleteDialogOpen(false);
    setDocIndex(null);
  };

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setSelectedSchema(newValue);
    const name = schemas[newValue].name;
    handleSchemaChange(name);
  };

  const handleEditClick = () => {
    const currentSelectedDocument = documents[docIndex];
    setSelectedDocument(currentSelectedDocument);
    setCreateDocument(true);
    // setDocIndex(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleMenuClose = () => {
    setDocIndex(null);
  };

  const addNewDocument = () => {
    setSelectedDocument(null);
    handleCreateDialog(true);
  };

  const handleCloseDeleteConfirmationDialog = () => {
    setDocIndex(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = () => {
    const documentId = documents[docIndex]._id;
    const schemaName = schemas[selectedSchema].name;
    dispatch(asyncDeleteSchemaDocument({ schemaName, documentId }));
    handleCloseDeleteConfirmationDialog();
  };

  const handleCreateDocument = (schemaName: string, document: any) => {
    dispatch(asyncCreateSchemaDocument({ schemaName, document }));
    setCreateDocument(false);
  };

  const handleEditDocument = (schemaName: string, document: any) => {
    const _id = selectedDocument?._id;
    dispatch(asyncEditSchemaDocument({ schemaName, documentId: _id, documentData: document }));
    setCreateDocument(false);
  };

  const renderTree = (docItem: DocItem) => {
    return (
      <TreeItem key={docItem.id} nodeId={docItem.id} label={<TreeItemLabel docItem={docItem} />}>
        {Array.isArray(docItem.data)
          ? docItem.data.map((node: any, index: number) =>
              renderTree({ id: index.toString(), data: node })
            )
          : typeof docItem.data !== 'string' && docItem.data && Object.keys(docItem.data).length > 0
          ? createDocumentArray(docItem.data).map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

  return (
    <Container>
      <Box className={classes.root}>
        <Tabs
          value={selectedSchema}
          onChange={handleChange}
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
            <Button variant="contained" color="primary" onClick={() => addNewDocument()}>
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
              {documents.map((doc: any, index: number) => {
                return (
                  <Card key={`card${index}`} className={classes.card} variant={'outlined'}>
                    <Box
                      style={{
                        background: 'grey',
                        position: 'absolute',
                        height: 24,
                        width: 24,
                        borderRadius: 4,
                        left: 8,
                        top: 16,
                        transform: 'rotate(-90deg)',
                      }}>
                      <KeyboardArrowDown />
                    </Box>
                    <CardContent>
                      {createDocumentArray(doc).map((docItem, index) => {
                        return (
                          <TreeView
                            key={`treeView${index}`}
                            className={classes.tree}
                            disableSelection
                            defaultCollapseIcon={<ExpandMoreIcon />}
                            defaultExpanded={['root']}
                            defaultExpandIcon={<ChevronRightIcon />}>
                            {renderTree(docItem)}
                          </TreeView>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </TabPanel>
          ) : (
            <Box className={classes.emptyDocuments}>
              <p>No documents are available.</p>
              <Button variant="contained" color="primary" onClick={() => addNewDocument()}>
                Add Document
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Dialog
        open={createDocument}
        onClose={() => handleCreateDialog(false)}
        maxWidth={'md'}
        fullWidth={true}>
        <CreateDialog
          schema={schemas[selectedSchema]}
          handleCreate={handleCreateDocument}
          handleEdit={handleEditDocument}
          handleCancel={() => handleCreateDialog(false)}
          editData={selectedDocument}
        />
      </Dialog>
      <Dialog
        fullWidth
        maxWidth={'sm'}
        open={deleteDialogOpen}
        onClose={handleConfirmationDialogClose}>
        <DialogTitle id="new-custom-type" style={{ marginBottom: 16 }}>
          Delete document : {documents[docIndex]?._id}
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteConfirmationDialog}
            variant="contained"
            style={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className={classes.deleteButton}
            variant="contained"
            style={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchemaData;
