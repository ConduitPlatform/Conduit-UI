import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="storage" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_storage_size_bytes_total[10m]))"
                graphTitle="Storage size"
                label="Size (in bytes)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_folders_total[10m]))"
                graphTitle="Total folders"
                label="Folders"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_files_total[10m]))"
                graphTitle="Total files"
                label="Files"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default StorageDashboard;
