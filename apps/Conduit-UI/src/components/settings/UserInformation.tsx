import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import ConduitCheckbox from '../authentication/ConduitCheckbox';
import twoFA from '../../assets/svgs/twoFA.svg';
import { postRequest, putRequest } from '../../http/requestsConfig';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { asyncGetAdminById } from '../../redux/slices/settingsSlice';
import { useAppSelector } from '../../redux/store';
import moment from 'moment';

const UserInformation: FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [qrCode, setQrCode] = useState<string>('');
  const [drawer, setDrawer] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [twoFAChanged, setTwoFAChanged] = useState(false);

  const { selectedAdmin } = useAppSelector((state) => state.settingsSlice.data);

  useEffect(() => {
    dispatch(asyncGetAdminById('me'));
    setTwoFAChanged(false);
  }, [dispatch, twoFAChanged]);

  const handleToggleTwoFa = () => {
    let enable = false;
    if (selectedAdmin.hasTwoFA === false) {
      enable = true;
    } else {
      enable = false;
    }
    putRequest('/toggle-twofa', { enableTwoFa: enable }).then((res) => {
      if (res.data.message === 'OK') {
        setQrCode('');
        dispatch(enqueueSuccessNotification('Successfuly disabled Two Factor Authentication!'));
        setTwoFAChanged(true);
      } else {
        setQrCode(res.data.result);
        setDrawer(true);
      }
    });
  };

  const handleSubmitVerificationCode = () => {
    postRequest('/verify-qr-code', { code: verificationCode })
      .then(() => {
        dispatch(enqueueSuccessNotification('Successfuly enabled Two Factor Authentication!'));
        setTwoFAChanged(true);
      })
      .catch(() =>
        dispatch(enqueueErrorNotification('Verification code incorrect, signing out...'))
      );

    setDrawer(false);
    setVerificationCode('');
  };

  const handleCloseDrawer = () => {
    setDrawer(false);
    setVerificationCode('');
  };

  //TODO use mui list below

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography textAlign="center" variant={'h5'} mb={2}>
        User information
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary={`Username: ${selectedAdmin.username}`} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Created at: ${moment(selectedAdmin.createdAt).format('DD/MM/YY')}`}
          />
        </ListItem>
        <ListItem>
          <FormControl>
            <FormControlLabel
              label="Is super admin"
              control={
                <ConduitCheckbox sx={{ mx: 2 }} disabled checked={selectedAdmin.isSuperAdmin} />
              }
            />
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl>
            <FormControlLabel
              label="Two Factor Authentication"
              control={<ConduitCheckbox sx={{ mx: 2 }} disabled checked={selectedAdmin.hasTwoFA} />}
            />
          </FormControl>
        </ListItem>
      </List>

      <Button variant="outlined" onClick={() => handleToggleTwoFa()}>
        {selectedAdmin.hasTwoFA ? 'Disable 2FA' : 'Enable 2FA'}
      </Button>
      <SideDrawerWrapper
        closeDrawer={() => handleCloseDrawer()}
        open={drawer}
        title="Enable Two Factor Authentication">
        <Box
          display="flex"
          mt={14}
          alignItems="center"
          justifyContent="center"
          flexDirection="column">
          {qrCode !== '' && (
            <Box display="flex" alignItems="center" flexDirection="column" gap={5}>
              <img
                src={qrCode}
                style={{ border: `2px solid ${theme.palette.primary.main}` }}
                width="200px"
                height="auto"
                alt="qrCode"
              />
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography width="70%" textAlign="center">
                  Please scan the qr code above and insert your verification code to continue
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    label="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Button variant="outlined" onClick={() => handleSubmitVerificationCode()}>
                    Proceed
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={twoFA} width="200px" alt="addUser" />
          </Box>
        </Box>
      </SideDrawerWrapper>
    </Box>
  );
};

export default UserInformation;
