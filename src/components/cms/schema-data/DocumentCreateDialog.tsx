import { makeStyles } from '@material-ui/core/styles';
import React, { FC, memo, useEffect, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { Schema } from '../../../models/cms/CmsModels';
import { set, cloneDeep } from 'lodash';

import TreeFieldGenerator from '../tree-components/tree-document-creation/TreeFieldGenerator';

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
  const [fieldValues, setFieldValues] = useState<any>({});

  useEffect(() => {
    if (!open) setFieldValues({});
  }, [open]);

  const onChange = (value: string, parents: string[]) => {
    const fieldValuesClone = cloneDeep(fieldValues);
    const fieldValuesCloneSet = set(fieldValuesClone, parents, value);
    setFieldValues(fieldValuesCloneSet);
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
          <TreeFieldGenerator schema={schema} onChange={onChange} fieldValues={fieldValues} />
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
