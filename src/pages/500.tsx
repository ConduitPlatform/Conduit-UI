import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

const Custom500 = () => {
  return (
    <Box p={2} display={'flex'} justifyContent="center" alignItems={'center'} flex={1}>
      <Typography variant="h5">500 - Internal Server Error</Typography>
    </Box>
  );
};

export default Custom500;
