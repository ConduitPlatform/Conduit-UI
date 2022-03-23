import makeStyles from '@mui/styles/makeStyles';
import React, { FC, memo, useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Schema } from '../../../models/database/CmsModels';
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

  const onChange = (value: any, parents: string[]) => {
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
