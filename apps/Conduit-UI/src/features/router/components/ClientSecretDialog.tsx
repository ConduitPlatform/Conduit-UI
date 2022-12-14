import { CopyAllOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/store';
import { enqueueSuccessNotification } from '../../../hooks/useNotifier';

interface Props {
  open: boolean;
  handleClose: () => void;
}

const ClientSecretDialog: FC<Props> = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { clientSecret } = useAppSelector((state) => state.routerSlice.data);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(clientSecret);
    dispatch(enqueueSuccessNotification(`Client secret copied to clipboard!`));
  };
  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle id="simple-dialog-title">Security Client Generated</DialogTitle>
      <DialogContent>
        <Typography>
          {`Please store your client secret somewhere safe as you'll not be able to recover it later.`}
        </Typography>
        <Box p={4} display="flex" gap={2}>
          <TextField aria-readonly fullWidth value={clientSecret} />
          <IconButton disableRipple onClick={() => handleCopyToClipboard()}>
            <CopyAllOutlined />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={() => handleClose()}>
          I COPIED THE SECRET
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientSecretDialog;
