import { makeStyles } from '@material-ui/core/styles';
import React, { FC, memo, useCallback, useMemo, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { Schema } from '../../../models/cms/CmsModels';
import { Box, TextField } from '@material-ui/core';
import { ChevronRight, ExpandMore } from '@material-ui/icons';
import TreeView from '@material-ui/lab/TreeView';
import getDeepValue from '../../../utils/getDeepValue';
import { isFieldArray, isFieldObject, isFieldRelation } from './SchemaDataUtils';
import TreeItem from '@material-ui/lab/TreeItem';
import { CreateTreeItemLabel } from './TreeItemLabel';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme) => ({
  paperRoot: {
    height: '100%',
    maxHeight: '80vh',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  handleClose: () => void;
  handleCreate: () => void;
  schema: Schema;
}

const getFields = (schemaFields: any) => {
  const fields: any = [];

  Object.keys(schemaFields).forEach((objectKey: any) => {
    const fieldContent = schemaFields[objectKey];

    if (fieldContent.type && Object.keys(fieldContent.type).length < 1) return;

    const fieldItem = {
      name: objectKey,
      data: fieldContent,
      // key: uuidv4(),
    };
    fields.push(fieldItem);
  });

  return fields;
};

const DocumentCreateDialog: FC<Props> = ({ open, handleClose, handleCreate, schema }) => {
  const classes = useStyles();

  // const [expandable, setExpandable] = useState<string[]>([]);
  // const [expanded, setExpanded] = useState<string[]>([]);

  const onChange = (value: string) => {
    console.log(value);
  };

  const renderTree = useCallback((field: any) => {
    const isObject = field.data.type && typeof field.data.type !== 'string';

    return (
      <TreeItem
        key={field.name}
        nodeId={field.name}
        label={<CreateTreeItemLabel field={field} onChange={onChange} edit={!isObject} />}>
        {isObject &&
          Object.keys(field.data.type).map((node) =>
            renderTree({ name: node, data: field.data.type[node] })
          )}
      </TreeItem>
    );
  }, []);

  return (
    <Dialog
      classes={{ paper: classes.paperRoot }}
      fullWidth
      maxWidth="lg"
      open={open}
      onClose={handleClose}>
      <DialogTitle>Create Document</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {schema &&
          schema.fields &&
          getFields(schema.fields).map((field: any, index: number) => {
            return (
              <TreeView
                key={`treeView${index}`}
                disableSelection
                defaultCollapseIcon={<ExpandMore />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRight />}>
                {renderTree(field)}
              </TreeView>
            );
          })}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} color="primary" autoFocus>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DocumentCreateDialog);
