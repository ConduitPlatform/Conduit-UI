import React from 'react';
import { Box, Container } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="pushNotifications" />
        </Box>
      </Box>
    </Container>
  );
};

export default NotificationDashboard;
