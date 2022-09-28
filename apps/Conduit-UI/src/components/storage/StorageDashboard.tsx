import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item md={2} sm={6} xs={6}>
            <RequestsLatency small module="storage" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <ModuleHealth small module="storage" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount small title="Containers" expression="conduit_containers_total[5m]" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount small title="Folders" expression="conduit_folders_total[5m]" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount small title="Files" expression="conduit_files_total[5m]" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount
              small
              title="Size (bytes)"
              expression="conduit_storage_size_bytes_total[5m]"
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="storage" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StorageDashboard;
