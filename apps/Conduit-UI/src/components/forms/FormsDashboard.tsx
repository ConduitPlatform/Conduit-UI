import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const FormsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="forms" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <ModuleHealth small module="forms" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MetricCount small title="Forms" expression="conduit_forms_total[5m]" />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="forms" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormsDashboard;
