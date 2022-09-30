import { Box, useTheme } from '@mui/material';
import ScaleLoader from 'react-spinners/ScaleLoader';
import React from 'react';

const LoaderComponent = () => {
  const theme = useTheme();
  return (
    <Box
      display={'flex'}
      flex={1}
      sx={{
        height: '70vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ScaleLoader
        speedMultiplier={3}
        color={theme.palette.primary.main}
        loading={true}
        height={21}
        width={4}
      />
    </Box>
  );
};

export default LoaderComponent;
