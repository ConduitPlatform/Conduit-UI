import React, { useState, FC } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { postRequest, putRequest } from '../../http/requestsConfig';
import { IAdmin } from '../../models/settings/SettingsModels';
import { ArrowRight } from '@mui/icons-material';

interface Props {
  admin: IAdmin;
}

const TwoFactorAuthentication: FC<Props> = ({ admin }) => {
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleSubmitVerificationCode = () => {
    postRequest('/verify-qr-code', { code: verificationCode })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography textAlign="center" variant={'h5'}>
        Two Factor Authentication
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <FormControl>
          <FormControlLabel
            control={<Switch sx={{ m: 3 }} onChange={handleToggleTwoFa} />}
            label="Two Factor Authentication"
          />
        </FormControl>
        {qrCode !== '' && (
          <Box display="flex" alignItems="center" flexDirection="column" gap={3}>
            <img src={qrCode} width="200px" height="auto" alt="qrCode" />
            <Box display="flex" gap={2}>
              <TextField
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button onClick={() => handleSubmitVerificationCode()}>Proceed</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TwoFactorAuthentication;
