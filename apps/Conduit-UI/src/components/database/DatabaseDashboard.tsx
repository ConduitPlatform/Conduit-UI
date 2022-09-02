import { Box, Container } from '@mui/material';

import React from 'react';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box>
        <Box>
          <TotalRequestsByModule module="database" />
        </Box>
      </Box>
    </Container>
  );
};

export default DatabaseDashboard;
