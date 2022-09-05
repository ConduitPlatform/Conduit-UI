import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="router" />
        </Box>
      </Box>
    </Container>
  );
};

export default RouterDashboard;
