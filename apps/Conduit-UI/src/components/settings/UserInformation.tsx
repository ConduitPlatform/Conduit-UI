import React from 'react';
import { Box, FormControl, FormControlLabel, Switch, Typography } from '@mui/material';

const UserInformation = () => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography textAlign="center" variant={'h5'} mb={2}>
        User information
      </Typography>
      <Typography textAlign="center" variant={'h5'} mb={2}>
        info...
      </Typography>
      <Typography textAlign="center" variant={'h5'} mb={2}>
        info...
      </Typography>
      <Typography textAlign="center" variant={'h5'} mb={2}>
        info...
      </Typography>
      <Box display="flex" justifyContent="center">
        <FormControl>
          <FormControlLabel control={<Switch sx={{ m: 3 }} />} label="2 factor authentication" />
        </FormControl>
      </Box>
    </Box>
  );
};

export default UserInformation;
