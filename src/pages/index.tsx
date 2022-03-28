import Head from 'next/head';
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, Theme, Divider, Button, Link, Icon, styled, Card } from '@mui/material';

import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchemaIcon from '@mui/icons-material/VerticalSplit';
import SecretIcon from '@mui/icons-material/VpnKey';
import Description from '@mui/icons-material/Description';
import SwaggerModal from '../components/common/SwaggerModal';
import GraphQL from '../assets/svgs/graphQL.svg';
import Swagger from '../assets/svgs/swagger.svg';
import Image from 'next/image';

const BoxWithIconText = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const CustomizedDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  marginBottom: '10px',
}));

const CustomizedCard = styled(Card)(() => ({
  borderRadius: 8,
  backgroundColor: 'common.white',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 20,
  '&:hover': {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
  '&:focus': {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
}));

const Home = () => {
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Conduit - App</title>
      </Head>
      <div>
        <Container maxWidth="xl">
          <Box
            p={2}
            display={'flex'}
            justifyContent="flex-end"
            alignItems={'flex-end'}
            flex={1}
            sx={{ marginBottom: '20px', gap: 10 }}>
            <Button
              color="secondary"
              variant="outlined"
              startIcon={
                <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                  <Image src={Swagger} alt="swagger" />
                </Icon>
              }
              onClick={() => setSwaggerModal(true)}>
              SWAGGER
            </Button>
            <a
              style={{ textDecoration: 'none' }}
              href={`${process.env.CONDUIT_URL}/graphql`}
              target="_blank"
              rel="noreferrer">
              <Button
                color="secondary"
                startIcon={
                  <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                    <Image src={GraphQL} alt="swagger" />
                  </Icon>
                }
                variant="outlined">
                GraphQL
              </Button>
            </a>
            <a
              href="https://getconduit.dev/docs/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="secondary" startIcon={<Description />}>
                DOCUMENTATION
              </Button>
            </a>
          </Box>
        </Container>
        <Box p={2} display={'flex'} alignItems={'center'} flex={1} sx={{ marginBottom: '200px' }}>
          <Typography variant={'h4'} sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            Welcome to C
            <Slide timeout={1000} in direction={'down'}>
              <Typography variant={'h4'} component={'span'} role="img" aria-label="okhand">
                👌
              </Typography>
            </Slide>
            nduit!
          </Typography>
        </Box>
        <Container maxWidth="md">
          <Grid container spacing={6}>
            <Grid item sm={12} md={6}>
              <Link
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
                href="/authentication/signIn">
                <CustomizedCard>
                  <BoxWithIconText>
                    <SecretIcon />
                    <Typography> &nbsp; set up an auth method</Typography>
                  </BoxWithIconText>
                  <CustomizedDivider />
                  <Typography variant="subtitle2">
                    Easily login with the method of your choice!
                  </Typography>
                </CustomizedCard>
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/database/schemas">
                <CustomizedCard>
                  <BoxWithIconText>
                    <SchemaIcon />
                    <Typography align="center">&nbsp; create a schema</Typography>
                  </BoxWithIconText>
                  <CustomizedDivider />
                  <Typography variant="subtitle2">
                    Create your schema with a user friendly UI and start editing you documents right
                    away!
                  </Typography>
                </CustomizedCard>
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/email/config">
                <CustomizedCard>
                  <BoxWithIconText>
                    <EmailIcon />
                    <Typography> &nbsp;set up email provider</Typography>
                  </BoxWithIconText>
                  <CustomizedDivider />
                  <Typography variant="subtitle2">
                    Select your preferred provider and start mailing!
                  </Typography>
                </CustomizedCard>
              </Link>
            </Grid>
            <Grid item xs={6} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/settings/secrets">
                <CustomizedCard>
                  <BoxWithIconText>
                    <LockIcon />
                    <Typography>&nbsp; set up client secrets</Typography>
                  </BoxWithIconText>
                  <CustomizedDivider />
                  <Typography variant="subtitle2">
                    Set up your client secret across multiple platforms!
                  </Typography>
                </CustomizedCard>
              </Link>
            </Grid>
          </Grid>
          <SwaggerModal open={swaggerModal} setOpen={setSwaggerModal} swagger="App" title="App" />
        </Container>
      </div>
    </>
  );
};

export default Home;
