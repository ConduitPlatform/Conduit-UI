import React, { FC, memo, useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Schema } from '../../../../models/database/CmsModels';
import { set, cloneDeep } from 'lodash';

import TreeFieldGenerator from '../../tree-components/tree-document-creation/TreeFieldGenerator';

interface Props {
  open: boolean;
  handleClose: () => void;
  handleCreate: (fieldValues: any) => void;
  schema: Schema;
}

const DocumentCreateDialog: FC<Props> = ({ open, handleClose, handleCreate, schema }) => {
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
      sx={{
        '& .MuiDialog-paper': {
          height: '100%',
          maxHeight: '70vh',
        },
      }}
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
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <TreeFieldGenerator schema={schema} onChange={onChange} fieldValues={fieldValues} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
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
