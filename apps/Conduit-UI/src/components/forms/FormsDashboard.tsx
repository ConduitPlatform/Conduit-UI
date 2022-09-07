import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const FormsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="forms" />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_forms_total[10m]))"
              graphTitle="Conduit forms"
              label="Forms"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormsDashboard;
