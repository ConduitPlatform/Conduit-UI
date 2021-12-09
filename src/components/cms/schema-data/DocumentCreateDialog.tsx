import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
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

const getFields = (schemaFields: any[], depth: number) => {
  const fields: any = [];

  console.log('schemaFields', schemaFields);

  Object.keys(schemaFields).forEach((key: any) => {
    const fieldContent = schemaFields[key];
    // if (!fieldContent.type) return;

    if (fieldContent.type && Object.keys(fieldContent.type).length < 1) return;

    console.log(depth, 'schemaFields[key]', fieldContent.type);

    if (fieldContent.type) {
      console.log('schemaFields[key] group', getFields(fieldContent.type, depth + 1));
    }

    // let fieldItem: any;

    // if (fieldContent.type) {
    //   fieldItem = getFields(fieldContent.type);
    // } else {
    //   fieldItem = {
    //     name: key,
    //     data: fieldContent,
    //   };
    // }

    const fieldItem = {
      name: key,
      data: fieldContent,
    };
    fields.push(fieldItem);
  });

  return fields;
};

const DocumentCreateDialog: FC<Props> = ({ open, handleClose, handleCreate, schema }) => {
  const classes = useStyles();

  const onChange = (value: string) => {
    console.log(value);
  };

  const renderTree = (field: any) => {
    console.log('field', field);
    // const parentsArray = parents ? [...parents, document] : [document];
    // const parentArray = parentsArray.map((parent: any) => parent.id);
    //
    // const value = schema && getDeepValue(schema.fields, parentArray);
    //
    // const isArray = isFieldArray(field);
    // const isObject = isFieldObject(field);
    // const isRelation = isFieldRelation(value);

    // if ((isArray || isObject || isRelation) && !expandable.includes(document.id)) {
    //   setExpandable((prevState) => [...prevState, document.id]);
    // }

    return (
      <TreeItem
        key={field.name}
        nodeId={field.name}
        // onClick={() => {
        //   if (!isRelation || typeof document.data !== 'string') return;
        //   handleRelationClick(value.model, document.data, parentArray);
        // }}
        label={<CreateTreeItemLabel field={field} onChange={onChange} />}>
        {/*{field.data.type && renderTree}*/}
        {/*{isArray*/}
        {/*  ? document.data.map((node: Document, index: number) =>*/}
        {/*      renderTree({ id: index.toString(), data: node }, parentsArray)*/}
        {/*    )*/}
        {/*  : isObject*/}
        {/*  ? createDocumentArray(document.data).map((node) => renderTree(node, parentsArray))*/}
        {/*  : null}*/}
      </TreeItem>
    );
  };

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
          getFields(schema.fields, 0).map((field: any, index: number) => {
            return (
              <TreeView
                key={`treeView${index}`}
                // className={classes.tree}
                disableSelection
                // expanded={expanded}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRight />}
                // onNodeToggle={(event, nodeIds) => handleToggle(nodeIds)}
              >
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

export default DocumentCreateDialog;
