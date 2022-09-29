import { Box } from '@mui/material';
import ScaleLoader from 'react-spinners/ScaleLoader';
import React from 'react';

const LoaderComponent = () => {
  return (
    <Box
      display={'flex'}
      flex={1}
      sx={{
        height: '70vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    </Box>
  );
};

export default LoaderComponent;
