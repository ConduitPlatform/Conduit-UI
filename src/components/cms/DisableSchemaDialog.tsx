import React, { FC, useState } from 'react';
import { DialogTitle, DialogContent, DialogActions, Dialog, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, Chip, FormControlLabel, FormGroup } from '@material-ui/core';
import { isArray } from 'lodash';
import { Schema } from '../../models/cms/CmsModels';
import { SchemaUI } from './CmsModels';

const useStyles = makeStyles((theme) => ({
  closeIcon: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  enableButton: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
  archiveButton: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
}));

interface Props {
  open: boolean;
  handleClose: () => void;
  handleToggle: any;
  handleDelete: any;
  handleDeleteSchemas: any;
  selectedSchema: any;
}

const DisableSchemaDialog: FC<Props> = ({
  open,
  handleClose,
  handleToggle,
  handleDelete,
  handleDeleteSchemas,
  selectedSchema,
}) => {
  const classes = useStyles();
  const [deleteData, setDeleteData] = useState<boolean>(false);

  const createDialogTitle = (action: 'enable' | 'archive' | 'delete' | 'deleteMany') => {
    switch (action) {
      case 'enable': {
        return 'Enable CMS schema:';
      }
      case 'archive': {
        return 'Archive CMS schema:';
      }
      case 'delete': {
        return 'Delete CMS schema:';
      }
      case 'deleteMany': {
        return 'Delete CMS schemas:';
      }
      default:
        return '';
    }
  };

  const createDialogInfo = (action: 'enable' | 'archive' | 'delete' | 'deleteMany') => {
    switch (action) {
      case 'enable': {
        return 'This operation with enable the schema.';
      }
      case 'archive': {
        return "This operation won't delete existing documents.";
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
      case 'deleteMany':
        {
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
        return '';
    }
  };

  const generateButtonClass = (action: 'enable' | 'archive' | 'delete' | 'deleteMany') => {
    switch (action) {
      case 'enable': {
        return classes.enableButton;
      }
      case 'archive': {
        return classes.archiveButton;
      }
      case 'delete': {
        return classes.deleteButton;
      }
      case 'deleteMany': {
        return classes.deleteButton;
      }
    }
  };

  const generateButtonName = (action: 'enable' | 'archive' | 'delete' | 'deleteMany') => {
    switch (action) {
      case 'enable': {
        return 'Enable';
      }
      case 'archive': {
        return 'Archive';
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
        handleDeleteSchemas(deleteData);
        break;
      default:
        break;
    }
  };

  const extractNames = () => {
    if (isArray(selectedSchema.data)) {
      return selectedSchema.data.map((schema: Schema | SchemaUI, index: number) => (
        <Chip color="secondary" key={index} label={schema.name} />
      ));
    }

    return selectedSchema ? selectedSchema.data.name : '';
  };

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open} onClose={handleClose}>
      <DialogTitle id="new-custom-type" style={{ marginBottom: 16 }}>
        {createDialogTitle(selectedSchema.action)}
      </DialogTitle>
      <DialogContent>
        <span style={{ fontWeight: 'bold' }}>{extractNames()}</span>
      </DialogContent>
      <DialogContent>{createDialogInfo(selectedSchema.action)}</DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} variant="contained" style={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleClick}
          className={generateButtonClass(selectedSchema?.action)}
          variant="contained"
          style={{ textTransform: 'none' }}>
          {generateButtonName(selectedSchema.action)}
        </Button>
      </DialogActions>
      <Button onClick={handleClose} className={classes.closeIcon}>
        <CloseIcon />
      </Button>
    </Dialog>
  );
};

export default DisableSchemaDialog;
