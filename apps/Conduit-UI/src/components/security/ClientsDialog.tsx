import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from '../../redux/store';
import {
  Box,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import ClientPlatformEnum from '../../models/ClientPlatformEnum';
import { IPlatformTypes } from '../../models/security/SecurityModels';
import { asyncGenerateNewClient, asyncGetAvailableClients } from '../../redux/slices/securitySlice';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { getErrorData } from '../../utils/error-handler';

interface Props {
  open: boolean;
  handleClose: () => void;
}

const ClientsDialog: React.FC<Props> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();
  const [platform, setPlatform] = useState<IPlatformTypes>('WEB');
  const [domain, setDomain] = useState<string>('*');

  const handleGenerateNew = () => {
    if (platform === 'WEB' && (!domain || domain.length === 0)) {
      dispatch(enqueueErrorNotification(`Domain needs to be set for web clients`));
      return;
    }
    dispatch(asyncGenerateNewClient({ platform, domain }));
    setTimeout(() => {
      dispatch(asyncGetAvailableClients());
    }, 140);
    dispatch(enqueueSuccessNotification('New client secret created!'));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="simple-dialog-title">
        Generate Client
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          gap={1}
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          padding={4}
          minWidth="500px">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Platform</InputLabel>
            <Select
              size="small"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Platform"
              value={platform}
              onChange={(event: SelectChangeEvent<any>) => setPlatform(event.target.value)}>
              <MenuItem value={ClientPlatformEnum.WEB}>WEB</MenuItem>
              <MenuItem value={ClientPlatformEnum.ANDROID}>ANDROID</MenuItem>
              <MenuItem value={ClientPlatformEnum.IOS}>IOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.IPADOS}>IPADOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.LINUX}>LINUX</MenuItem>
              <MenuItem value={ClientPlatformEnum.MACOS}>MACOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.WINDOWS}>WINDOWS</MenuItem>
            </Select>
            {platform === ClientPlatformEnum.WEB && (
              <>
                <TextField
                  size="small"
                  id="domain-field"
                  label="Domain"
                  margin={'normal'}
                  value={domain}
                  onChange={(event: React.ChangeEvent<{ value: string }>) =>
                    setDomain(event.target.value)
                  }></TextField>
              </>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant={'contained'}
          color={'primary'}
          size="small"
          fullWidth
          onClick={handleGenerateNew}>
          Generate new Client
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientsDialog;
