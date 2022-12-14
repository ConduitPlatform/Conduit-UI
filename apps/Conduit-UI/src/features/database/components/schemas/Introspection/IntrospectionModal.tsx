import { Close } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { Schema } from '../../../models/CmsModels';
import { asyncFinalizeIntrospectedSchema } from '../../../store/databaseSlice';
import { useAppDispatch } from '../../../../../redux/store';
import { getSchemaFieldsWithExtra } from '../../../../../utils/type-functions';
import SchemaViewer from '../SchemaOverview/SchemaViewer';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  schema: Schema;
}

const IntrospectionModal: FC<Props> = ({ open, setOpen, schema }) => {
  const dispatch = useAppDispatch();
  const [schemaToEdit, setSchemaToEdit] = useState(schema);

  useEffect(() => {
    setSchemaToEdit(schema);
  }, [schema]);

  const formattedFields = getSchemaFieldsWithExtra(schemaToEdit.fields);

  const handleFinalizeSchema = () => {
    dispatch(asyncFinalizeIntrospectedSchema([schemaToEdit]));
    setOpen(false);
  };

  return (
    <Dialog
      fullWidth
      PaperProps={{ sx: { width: '100%', borderRadius: '12px' } }}
      maxWidth={'lg'}
      open={open}
      onClose={() => setOpen(false)}>
      <DialogTitle>
        <Typography>Introspection for schema: {schema.name}</Typography>
        <IconButton
          disableRipple
          onClick={() => setOpen(false)}
          sx={{ position: 'absolute', right: '2%', top: '1%', color: 'gray' }}
          size="large">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 4 }}>
        {Object.keys({ newTypeFields: formattedFields }).map((dataKey, i) => (
          <SchemaViewer
            editable
            dataKey={dataKey}
            data={{ newTypeFields: formattedFields }}
            schemaToEdit={schemaToEdit}
            setSchemaToEdit={setSchemaToEdit}
            key={i}
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button onClick={handleFinalizeSchema} variant="contained" color="primary">
          finalize schema
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IntrospectionModal;
