import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
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
import { AdminPanelSettings, ArrowForwardIos, CalendarMonth, Person } from '@mui/icons-material';
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

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography textAlign="center" variant={'h5'} mb={2}>
        User information
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={`Username: ${selectedAdmin.username}`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CalendarMonth />
          </ListItemIcon>
          <ListItemText
            primary={`Created at: ${moment(selectedAdmin.createdAt).format('DD/MM/YY')}`}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AdminPanelSettings />
          </ListItemIcon>
          <FormControl>
            <FormControlLabel
              labelPlacement="start"
              label="Is super admin"
              control={
                <ConduitCheckbox sx={{ mx: 2 }} disabled checked={selectedAdmin.isSuperAdmin} />
              }
            />
          </FormControl>
        </ListItem>
        <ListItem sx={{ display: 'flex', justifyContent: 'center' }} alignItems="center">
          <Button
            endIcon={<ArrowForwardIos />}
            variant="outlined"
            onClick={() => handleToggleTwoFa()}>
            {selectedAdmin.hasTwoFA ? '2FA Enabled - Disable it?' : '2FA Disabled - Enable it?'}
          </Button>
        </ListItem>
      </List>

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
