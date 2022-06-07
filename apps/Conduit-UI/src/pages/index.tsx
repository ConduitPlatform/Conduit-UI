import Head from 'next/head';
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, Button, Link, Icon, useTheme, useMediaQuery } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchemaIcon from '@mui/icons-material/VerticalSplit';
import SecretIcon from '@mui/icons-material/VpnKey';
import Description from '@mui/icons-material/Description';
import { SwaggerModal, HomePageCard } from '@conduitplatform/ui-components';
import GraphQL from '../assets/svgs/graphQL.svg';
import Swagger from '../assets/svgs/swagger.svg';
import Image from 'next/image';
import getConfig from 'next/config';
import {
  homePageFontSizeHeader,
  homePageFontSizeSubtitles,
  homePageFontSizeTitles,
} from '../theme';

const {
  publicRuntimeConfig: { CONDUIT_URL },
} = getConfig();

export const CONDUIT_API = process.env.IS_DEV ? process.env.CONDUIT_URL : CONDUIT_URL;

const Home = () => {
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Head>
        <title>Conduit - App</title>
      </Head>
      <div>
        <Box
          p={2}
          display={'flex'}
          justifyContent="flex-end"
          alignItems={'flex-end'}
          flex={1}
          sx={{ marginBottom: '20px', gap: 2 }}>
          <Button color="secondary" variant="outlined" onClick={() => setSwaggerModal(true)}>
            <Icon sx={{ display: 'flex', alignContent: 'center' }}>
              <Image src={Swagger} alt="swagger" />
            </Icon>
            <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
              {smallScreen ? null : 'SWAGGER'}
            </Typography>
          </Button>
          <a
            style={{ textDecoration: 'none' }}
            href={`${CONDUIT_API}/graphql`}
            target="_blank"
            rel="noreferrer">
            <Button color="secondary" variant="outlined">
              <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                <Image src={GraphQL} alt="swagger" />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'GraphQL'}
              </Typography>
            </Button>
          </a>
          <a
            href="https://getconduit.dev/docs/overview/intro"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="secondary">
              <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                <Description />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'DOCUMENTATION'}
              </Typography>
            </Button>
          </a>
        </Box>

        <Box
          display={'flex'}
          alignItems={'center'}
          flex={1}
          sx={{ marginBottom: { md: 20, sm: 5, xs: 5 } }}>
          <Typography
            variant={'h4'}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flex: 1,
              fontSize: homePageFontSizeHeader,
            }}
            noWrap>
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
            <Grid item xs={12} md={6} overflow={'hidden'}>
              <Link
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
                href="/authentication/signIn">
                <HomePageCard
                  subtitleProps={{
                    height: '40px',
                    fontSize: homePageFontSizeSubtitles,
                    mb: '8px',
                  }}
                  titleProps={{
                    noWrap: true,
                    fontSize: homePageFontSizeTitles,
                  }}
                  icon={<SecretIcon />}
                  title="set up an auth method"
                  description="Easily login with the method of your choice!"
                />
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/database/schemas">
                <HomePageCard
                  subtitleProps={{
                    height: '40px',
                    fontSize: homePageFontSizeSubtitles,
                    mb: '8px',
                  }}
                  titleProps={{ noWrap: true, fontSize: homePageFontSizeTitles }}
                  icon={<SchemaIcon />}
                  title="create a schema"
                  description={
                    'Create your schema with a user friendly UI and start editing you documents right away!'
                  }
                />
              </Link>
            </Grid>

            <Grid item xs={12} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/email/config">
                <HomePageCard
                  subtitleProps={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: '8px' }}
                  titleProps={{ noWrap: true, fontSize: homePageFontSizeTitles }}
                  icon={<EmailIcon />}
                  title="set up email provider"
                  description="Select your preferred provider and start mailing!"
                />
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link style={{ textDecoration: 'none', cursor: 'pointer' }} href="/settings/secrets">
                <HomePageCard
                  subtitleProps={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: '8px' }}
                  titleProps={{ noWrap: true, fontSize: homePageFontSizeTitles }}
                  icon={<LockIcon />}
                  title="set up client secrets"
                  description="Set up your client secret across multiple platforms!"
                />
              </Link>
            </Grid>
          </Grid>
          <SwaggerModal
            open={swaggerModal}
            setOpen={setSwaggerModal}
            swagger="App"
            title="App"
            baseUrl={`${CONDUIT_API}`}
          />
        </Container>
      </div>
    </>
  );
};

export default Home;
