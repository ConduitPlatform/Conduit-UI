import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item md={3} sm={6} xs={6}>
          <RequestsLatency module="storage" />
        </Grid>
        <Grid item md={3} sm={6} xs={6}>
          <ModuleHealth module="storage" />
        </Grid>
        <Grid item md={3} sm={6} xs={6}>
          <MetricCount title="Containers" expression="conduit_containers_total[5m]" />
        </Grid>
        <Grid item md={3} sm={6} xs={6}>
          <MetricCount title="Folders" expression="conduit_folders_total[5m]" />
        </Grid>
        <Grid item md={3} sm={6} xs={6}>
          <MetricCount title="Files" expression="conduit_files_total[5m]" />
        </Grid>
        <Grid item md={3} sm={6} xs={6}>
          <MetricCount title="Size (bytes)" expression="conduit_storage_size_bytes_total[5m]" />
        </Grid>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="storage" />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StorageDashboard;
