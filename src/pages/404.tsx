import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

const Custom404 = () => {
  return (
    <Box p={2} display={'flex'} justifyContent="center" alignItems={'center'} flex={1}>
      <Typography variant="h5">404 - Page Not Found</Typography>
    </Box>
  );
};

export default Custom404;
