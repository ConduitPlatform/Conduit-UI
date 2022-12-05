import React, { FC, useState } from 'react';
import Box from '@mui/material/Box';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useAppDispatch } from '../../../../../redux/store';
import { enqueueInfoNotification } from '../../../../../utils/useNotifier';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import { LinkComponent } from '@conduitplatform/ui-components';

interface Props {
  open: boolean;
  handleClose: () => void;
  systemSchemas: string[];
}

const NewSchemaDialog: FC<Props> = ({ open, handleClose, systemSchemas }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [typeName, setTypeName] = useState('');

  const handleTypeName = (value: string) => {
    const regex = /[^a-z0-9_]/gi;
    if (regex.test(value)) {
      dispatch(
        enqueueInfoNotification(
          'The schema name can only contain alpharithmetics and _',
          'duplicate'
        )
      );
    }

    if (systemSchemas.find((systemSchema) => systemSchema === value)) {
      dispatch(enqueueInfoNotification('This schema name is reserved by a system schema'));
    }

    setTypeName(value.replace(/[^a-z0-9_]/gi, ''));
  };

  const handleAddType = () => {
    setTypeName('');
    handleClose();
  };

  const handleCloseClick = () => {
    setTypeName('');
    handleClose();
  };

  const isDisabled = () => {
    if (systemSchemas.find((systemSchema) => systemSchema === typeName)) {
      return true;
    } else if (typeName === '') {
      return true;
    } else return false;
  };

  return (
    <Dialog fullWidth={true} maxWidth={'sm'} open={open} onClose={handleCloseClick}>
      <Box maxWidth={600}>
        <DialogTitle id="new-custom-type" sx={{ textAlign: 'center', marginBottom: 4 }}>
          Create new Schema
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <TextField
              sx={{ width: '70%', mb: 4, mt: 2 }}
              id="type-name"
              label="Enter your Schema name"
              variant="outlined"
              value={typeName}
              onChange={(event) => handleTypeName(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === 'Enter' && typeName !== '') {
                  router.push(`schemas/${typeName}?isNew=true`);
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <LinkComponent href={`schemas/${typeName}?isNew=true`} underline={'none'}>
            <Button
              onClick={handleAddType}
              color="primary"
              sx={{ mb: 3 }}
              variant="contained"
              disabled={isDisabled()}>
              Create new Schema
            </Button>
          </LinkComponent>
        </DialogActions>
      </Box>
      <Button onClick={handleCloseClick} sx={{ position: 'absolute', top: 8, right: 2 }}>
        <CloseIcon />
      </Button>
    </Dialog>
  );
};

export default NewSchemaDialog;
