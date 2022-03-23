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
import { useAppDispatch } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { useRouter } from 'next/router';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

const useStyles = makeStyles((theme) => ({
  paper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  boxType: {
    backgroundColor: 'white',
    height: 300,
    width: 300,
    padding: theme.spacing(5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  selectedType: {
    backgroundColor: theme.palette.grey[100],
  },
  closeIcon: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  textField: {
    width: '100%',
    marginBottom: 16,
  },
  dialogTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  anchor: {
    textDecoration: 'none',
  },
  actions: {
    justifyContent: 'center',
  },
}));

interface Props {
  open: boolean;
  handleClose: () => void;
}

const NewSchemaDialog: FC<Props> = ({ open, handleClose }) => {
  const classes = useStyles();
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

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'sm'}
      open={open}
      onClose={handleCloseClick}
      classes={{ paper: classes.paper }}>
      <Box maxWidth={600}>
        <DialogTitle id="new-custom-type" className={classes.dialogTitle}>
          Create new Schema
        </DialogTitle>
        <DialogContent>
          <TextField
            className={classes.textField}
            id="type-name"
            label="Enter your type name"
            variant="outlined"
            value={typeName}
            onChange={(event) => handleTypeName(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && typeName !== '') {
                router.push(`schemas/${typeName}`);
              }
            }}
          />
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Link href={`schemas/${typeName}`}>
            <a className={classes.anchor}>
              <Button
                onClick={handleAddType}
                color="primary"
                variant="contained"
                disabled={typeName === ''}>
                Create new Schema
              </Button>
            </a>
          </Link>
        </DialogActions>
      </Box>
      <Button onClick={handleCloseClick} className={classes.closeIcon}>
        <CloseIcon />
      </Button>
    </Dialog>
  );
};

export default NewSchemaDialog;
