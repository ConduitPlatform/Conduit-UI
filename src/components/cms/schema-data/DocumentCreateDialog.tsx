import { makeStyles } from '@material-ui/core/styles';
import React, { FC, memo, useEffect, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { Schema } from '../../../models/cms/CmsModels';
import { ChevronRight, ExpandMore } from '@material-ui/icons';
import TreeView from '@material-ui/lab/TreeView';
import { getExpandableFields, getFieldsArray } from './SchemaDataUtils';
import TreeItem from '@material-ui/lab/TreeItem';
import { CreateTreeItemLabel } from './TreeItemLabel';
import { set, cloneDeep } from 'lodash';
import getDeepValue from '../../../utils/getDeepValue';

const useStyles = makeStyles((theme) => ({
  paperRoot: {
    height: '100%',
    maxHeight: '70vh',
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
  handleCreate: (fieldValues: any) => void;
  schema: Schema;
}

const DocumentCreateDialog: FC<Props> = ({ open, handleClose, handleCreate, schema }) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [fieldsArray, setFieldsArray] = useState<any[]>([]);
  const [fieldValues, setFieldValues] = useState<any>({});

  useEffect(() => {
    if (schema && schema.fields) {
      setFieldsArray(getFieldsArray(schema.fields));
    }
  }, [schema]);

  useEffect(() => {
    if (!open) setFieldValues({});
  }, [open]);

  const onChange = (value: string, parents: string[]) => {
    const fieldValuesClone = cloneDeep(fieldValues);
    const fieldValuesCloneSet = set(fieldValuesClone, parents, value);
    setFieldValues(fieldValuesCloneSet);
  };

  useEffect(() => {
    if (schema && schema.fields) {
      setExpanded(getExpandableFields(schema.fields));
    }
  }, [schema]);

  const renderTree = (field: any, parents?: any) => {
    switch (field.name) {
      case 'createdAt':
      case 'updatedAt':
      case '_id':
        return <></>;
    }
    const parentsArray = parents ? [...parents, field.name] : [field.name];

    const isObject = field.data.type && typeof field.data.type !== 'string';

    const value = !isObject && getDeepValue(fieldValues, parents ? parents : []);
    const inputValue = value && value[field.name] ? value[field.name] : '';
    const isRequired = field.data.required;

    return (
      <TreeItem
        key={field.name}
        nodeId={field.name}
        label={
          <CreateTreeItemLabel
            field={field}
            value={inputValue}
            onChange={(event) => onChange(event, parentsArray)}
            edit={!isObject}
            required={isRequired}
          />
        }>
        {isObject &&
          Object.keys(field.data.type).map((node) => {
            let tempField = { name: node, data: field.data.type[node] };
            const dataFieldType = tempField.data;
            if (typeof dataFieldType === 'string') {
              tempField = { ...tempField, data: { ...field.data, type: dataFieldType } };
            }
            return renderTree(tempField, parentsArray);
          })}
      </TreeItem>
    );
  };

  return (
    <Dialog
      classes={{ paper: classes.paperRoot }}
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}>
      <DialogTitle>Create Document</DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate(fieldValues);
        }}>
        <DialogContent className={classes.dialogContent}>
          {fieldsArray.map((field: any, index: number) => {
            return (
              <TreeView
                key={`treeView${index}`}
                disableSelection
                expanded={expanded}
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
          <Button type={'submit'} variant="contained" color="primary" autoFocus>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default memo(DocumentCreateDialog);
