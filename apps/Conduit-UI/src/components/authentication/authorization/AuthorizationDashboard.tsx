import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import CreateOrganizationDrawer from './CreateOrganizationDrawer';

const AuthorizationDashboard = () => {
  const [drawer, setDrawer] = useState(false);
  const noOrganizationsMessage = () => {
    return (
      <Box
        pt="20vh"
        alignItems="center"
        display="flex"
        flexDirection="column"
        gap={2}
        justifyContent="center">
        <Typography>There are currently no teams/organizations</Typography>
        <Button onClick={() => setDrawer(true)} variant="outlined">
          Create one?
        </Button>
      </Box>
    );
  };
  return (
    <Container>
      {noOrganizationsMessage()}
      <SideDrawerWrapper
        open={drawer}
        maxWidth={550}
        title="Create a team / organization"
        closeDrawer={() => {
          setDrawer(false);
        }}>
        <CreateOrganizationDrawer />
      </SideDrawerWrapper>
    </Container>
  );
};

export default AuthorizationDashboard;
