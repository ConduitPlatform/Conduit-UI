import React, { FC, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { isArray } from 'lodash';
import { Schema } from '../../../models/CmsModels';
import { SchemaUI } from '../../../models/CmsModels';

interface Props {
  open: boolean;
  handleClose: () => void;
  handleToggle: () => void;
  handleToggleSchemas?: () => void;
  handleDelete: (deleteData: boolean) => void;
  handleDeleteSchemas?: (deleteData: boolean) => void;
  selectedSchema: any;
}

export type actions =
  | ''
  | 'enable'
  | 'archive'
  | 'enableMany'
  | 'archiveMany'
  | 'delete'
  | 'deleteMany';

const SchemaActionsDialog: FC<Props> = ({
  open,
  handleClose,
  handleToggle,
  handleToggleSchemas,
  handleDelete,
  handleDeleteSchemas,
  selectedSchema,
}) => {
  const [deleteData, setDeleteData] = useState<boolean>(false);

  const createDialogTitle = (action: actions) => {
    switch (action) {
      case 'enable': {
        return 'Enableschema:';
      }
      case 'archive': {
        return 'Archive schema:';
      }
      case 'enableMany': {
        return 'Enable selected schemas:';
      }
      case 'archiveMany': {
        return 'Archive selected schemas:';
      }
      case 'delete': {
        return 'Delete schema:';
      }
      case 'deleteMany': {
        return 'Delete schemas:';
      }
      default:
        return '';
    }
  };

  const createDialogInfo = (action: actions) => {
    switch (action) {
      case 'enable': {
        return 'This operation with enable the schema.';
      }
      case 'archive': {
        return "This operation won't delete existing documents.";
      }
      case 'enableMany': {
        return 'This operation will enable selected schemas.';
      }
      case 'archiveMany': {
        return 'This operation will archive selected schemas.';
      }
      case 'delete': {
        return (
          <>
            <FormGroup>
              <FormControlLabel
                disabled
                control={<Checkbox defaultChecked />}
                label="Selected schema will be deleted"
              />
              <FormControlLabel
                control={
                  <Checkbox onClick={() => setDeleteData(!deleteData)} checked={deleteData} />
                }
                label="Delete schema data"
              />
            </FormGroup>
          </>
        );
      }
      case 'deleteMany': {
        return (
          <>
            <FormGroup>
              <FormControlLabel
                disabled
                control={<Checkbox defaultChecked />}
                label="Selected schemas will be deleted"
              />
              <FormControlLabel
                control={
                  <Checkbox onClick={() => setDeleteData(!deleteData)} checked={deleteData} />
                }
                label="Delete schema data"
              />
            </FormGroup>
          </>
        );
      }
      default:
        return '';
    }
  };

  const generateButton = (action: actions) => {
    switch (action) {
      case 'enable': {
        return 'success.main';
      }
      case 'archive': {
        return 'primary.main';
      }
      case 'enableMany': {
        return 'success.main';
      }
      case 'archiveMany': {
        return 'primary.main';
      }
      case 'delete': {
        return 'error.main';
      }
      case 'deleteMany': {
        return 'error.main';
      }
    }
  };

  const generateButtonName = (action: actions) => {
    switch (action) {
      case 'enable': {
        return 'Enable';
      }
      case 'archive': {
        return 'Archive';
      }
      case 'enableMany': {
        return 'Enable Schemas';
      }
      case 'archiveMany': {
        return 'Archive Schemas';
      }
      case 'delete': {
        return 'Delete';
      }
      case 'deleteMany': {
        return 'Delete';
      }
      default:
        return '';
    }
  };

  const handleClick = () => {
    switch (selectedSchema.action) {
      case 'enable':
      case 'archive':
        handleToggle();
        break;
      case 'delete':
        handleDelete(deleteData);
        break;
      case 'deleteMany':
        handleDeleteSchemas && handleDeleteSchemas(deleteData);
        break;
      case 'archiveMany':
        handleToggleSchemas && handleToggleSchemas();
        break;
      case 'enableMany':
        handleToggleSchemas && handleToggleSchemas();
        break;
      default:
        break;
    }
  };

  const extractNames = () => {
    if (isArray(selectedSchema.data)) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            '& > *': {
              margin: 0.5,
            },
          }}>
          {selectedSchema.data.map((schema: Schema | SchemaUI, index: number) => (
            <Chip color="primary" key={index} label={schema.name} />
          ))}
        </Box>
      );
    }

    return selectedSchema ? selectedSchema.data.name : '';
  };

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open} onClose={handleClose}>
      <DialogTitle id="new-custom-type" sx={{ marginBottom: '16px' }}>
        {createDialogTitle(selectedSchema.action)}
      </DialogTitle>
      <DialogContent>
        <span style={{ fontWeight: 'bold' }}>{extractNames()}</span>
      </DialogContent>
      <DialogContent>{createDialogInfo(selectedSchema.action)}</DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} variant="outlined" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleClick}
          sx={{ color: 'common.white', backgroundColor: generateButton(selectedSchema?.action) }}
          variant="contained">
          {generateButtonName(selectedSchema.action)}
        </Button>
      </DialogActions>
      <Button onClick={handleClose} sx={{ position: 'absolute', top: 10, right: 2 }}>
        <CloseIcon />
      </Button>
    </Dialog>
  );
};

export default SchemaActionsDialog;
