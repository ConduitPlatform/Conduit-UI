import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from '../../redux/store';
import { Box, DialogActions, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import ClientPlatformEnum from '../../models/ClientPlatformEnum';
import { IPlatformTypes } from '../../models/settings/SettingsModels';
import { asyncGenerateNewClient, asyncGetAvailableClients } from '../../redux/slices/settingsSlice';
import { enqueueSuccessNotification } from '../../utils/useNotifier';

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SecretsDialog: React.FC<Props> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();
  const [platform, setPlatform] = useState<IPlatformTypes>('WEB');

  const handleGenerateNew = () => {
    dispatch(asyncGenerateNewClient(platform));
    setTimeout(() => {
      dispatch(asyncGetAvailableClients());
    }, 140);
    dispatch(enqueueSuccessNotification('New cliend secret created!'));
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
              onChange={(event: any) => setPlatform(event.target.value)}>
              <MenuItem value={ClientPlatformEnum.WEB}>WEB</MenuItem>
              <MenuItem value={ClientPlatformEnum.ANDROID}>ANDROID</MenuItem>
              <MenuItem value={ClientPlatformEnum.IOS}>IOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.IPADOS}>IPADOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.LINUX}>LINUX</MenuItem>
              <MenuItem value={ClientPlatformEnum.MACOS}>MACOS</MenuItem>
              <MenuItem value={ClientPlatformEnum.WINDOWS}>WINDOWS</MenuItem>
            </Select>
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

export default SecretsDialog;
