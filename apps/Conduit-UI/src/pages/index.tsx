import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, Button, Icon, useTheme, useMediaQuery, Divider } from '@mui/material';
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
import { homePageFontSizeHeader, homePageFontSizeSubtitles } from '../theme';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { asyncGetIntrospectionStatus } from '../redux/slices/databaseSlice';
import { ScreenSearchDesktopRounded } from '@mui/icons-material';
import { LinkComponent } from '@conduitplatform/ui-components';

const Home = () => {
  const dispatch = useAppDispatch();
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { introspectionStatus } = useAppSelector((state) => state.databaseSlice.data);
  useEffect(() => {
    dispatch(asyncGetIntrospectionStatus());
  }, [dispatch]);

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
          <Button color="primary" variant="outlined" onClick={() => setSwaggerModal(true)}>
            <Icon sx={{ display: 'flex', alignContent: 'center' }}>
              <Image src={Swagger} alt="swagger" />
            </Icon>
            <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
              {smallScreen ? null : 'SWAGGER'}
            </Typography>
          </Button>
          <a
            style={{ textDecoration: 'none' }}
            href={`/api/graphql`}
            target="_blank"
            rel="noreferrer">
            <Button color="primary" variant="outlined">
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
            <Button variant="contained" color="primary">
              <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                <Description />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'DOCUMENTATION'}
              </Typography>
            </Button>
          </a>
        </Box>

        <Box display={'flex'} alignItems={'center'} flex={1} sx={{ marginBottom: 5 }}>
          <Typography
            variant={'h4'}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flex: 1,
              fontSize: homePageFontSizeHeader,
            }}>
            Welcome to C
            <Slide timeout={1000} in direction={'down'}>
              <Typography variant={'h4'} component={'span'} role="img" aria-label="okhand">
                👌
              </Typography>
            </Slide>
            nduit!
          </Typography>
        </Box>
        <Container maxWidth="md" sx={{ marginBottom: 4 }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <LinkComponent href="/authentication/signIn" underline={'none'}>
                <HomePageCard
                  icon={<SecretIcon />}
                  title="Set up an auth method"
                  descriptionContent={
                    <Typography
                      variant="subtitle2"
                      sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                      Easily login with the method of your choice!
                    </Typography>
                  }
                />
              </LinkComponent>
            </Grid>
            <Grid item xs={12} md={6}>
              <LinkComponent href="/database/schemas" underline={'none'}>
                <HomePageCard
                  icon={<SchemaIcon />}
                  title="Create a schema"
                  descriptionContent={
                    <Typography
                      variant="subtitle2"
                      sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                      Create your schema with a user friendly UI and start editing you documents
                      right away!
                    </Typography>
                  }
                />
              </LinkComponent>
            </Grid>

            <Grid item xs={12} md={6}>
              <LinkComponent href="/email/config" underline={'none'}>
                <HomePageCard
                  icon={<EmailIcon />}
                  title="Set up email provider"
                  descriptionContent={
                    <Typography
                      variant="subtitle2"
                      sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                      Select your preferred provider and start mailing!
                    </Typography>
                  }
                />
              </LinkComponent>
            </Grid>
            <Grid item xs={12} md={6}>
              <LinkComponent href="/security/clients" underline={'none'}>
                <HomePageCard
                  icon={<LockIcon />}
                  title="Set up client secrets"
                  descriptionContent={
                    <Typography
                      variant="subtitle2"
                      sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                      Set up your client secret across multiple platforms!
                    </Typography>
                  }
                />
              </LinkComponent>
            </Grid>
            <Grid item xs={12} md={6}>
              <LinkComponent href="/database/introspection" underline={'none'}>
                <HomePageCard
                  icon={<ScreenSearchDesktopRounded />}
                  title="Introspection"
                  descriptionContent={
                    <Box
                      display="flex"
                      justifyContent={'space-around'}
                      sx={{ height: '40px', mb: 1 }}>
                      <Box display="flex" flexDirection={'row'} alignItems={'center'}>
                        <Typography sx={{ fontSize: homePageFontSizeSubtitles }}>
                          Foreign Schemas:
                        </Typography>
                        <Typography
                          color="error"
                          ml={1}
                          sx={{ fontSize: homePageFontSizeSubtitles }}>
                          {introspectionStatus.foreignSchemaCount}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" sx={{ marginX: 2 }} />
                      <Box display="flex" flexDirection={'row'} alignItems={'center'}>
                        <Typography sx={{ fontSize: homePageFontSizeSubtitles }}>
                          Imported Schemas:
                        </Typography>
                        <Typography
                          color="primary"
                          ml={1}
                          sx={{ fontSize: homePageFontSizeSubtitles }}>
                          {introspectionStatus.importedSchemaCount}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </LinkComponent>
            </Grid>
          </Grid>
          <SwaggerModal
            open={swaggerModal}
            setOpen={setSwaggerModal}
            swagger="App"
            title="App"
            baseUrl={`/api`}
          />
        </Container>
      </div>
    </>
  );
};

export default Home;
