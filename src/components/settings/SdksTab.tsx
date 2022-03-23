import { Container, Grid, Typography } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import Button from '@mui/material/Button';
import React from 'react';

const SdksTab: React.FC = () => {
  return (
    <Container>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant={'h5'}>
            See and download all the available SDKs for conduit
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={'h6'}>GraphQL SDKs</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetApp />}
            onClick={() => {
              window.open('https://tenor.com/view/handgesturesmyt-ok-okay-gif-14118577', '_blank');
            }}>
            GraphQL client
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SdksTab;
