import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ChangePassword from './ChangePassword';
import UserInformation from './UserInformation';

const UserSettingsLayout = () => {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ padding: 4, borderRadius: 8 }}>
        <Grid container spacing={3}>
          <Grid item minHeight={'325px'} xs={12} md={12} lg={6}>
            <UserInformation />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <ChangePassword />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserSettingsLayout;
