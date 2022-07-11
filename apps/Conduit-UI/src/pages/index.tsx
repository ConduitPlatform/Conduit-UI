import Head from 'next/head';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, Button, Icon, useTheme, useMediaQuery, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchemaIcon from '@mui/icons-material/VerticalSplit';
import SecretIcon from '@mui/icons-material/VpnKey';
import Description from '@mui/icons-material/Description';
import {
  SwaggerModal,
  GraphQLModal,
  HomePageCard,
  LinkComponent,
} from '@conduitplatform/ui-components';
import GraphQL from '../assets/svgs/graphQL.svg';
import Swagger from '../assets/svgs/swagger.svg';
import Image from 'next/image';
import { homePageFontSizeHeader, homePageFontSizeSubtitles } from '../theme';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { asyncGetIntrospectionStatus } from '../redux/slices/databaseSlice';
import { ScreenSearchDesktopRounded } from '@mui/icons-material';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { CONDUIT_URL },
} = getConfig();

export const CONDUIT_API = process.env.IS_DEV ? process.env.CONDUIT_URL : CONDUIT_URL;

const Home = () => {
  const dispatch = useAppDispatch();
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);
  const [graphQLOpen, setGraphQLOpen] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { introspectionStatus } = useAppSelector((state) => state.databaseSlice.data);
  const transportsAdmin = useAppSelector((state) => state.settingsSlice?.adminSettings?.transports);
  const transportsRouter = useAppSelector((state) => state.routerSlice?.data?.config?.transports);
  const enabledModules = useAppSelector((state) => state.appAuthSlice?.data?.enabledModules);
  const SERVICE_API = useAppSelector((state) => state.routerSlice?.data?.config?.hostUrl);

  const noSwagger = useMemo(() => {
    return !transportsRouter.rest && !transportsAdmin.rest;
  }, [transportsAdmin.rest, transportsRouter.rest]);

  const noGraphQL = useMemo(() => {
    return !transportsRouter.graphql && !transportsAdmin.graphql;
  }, [transportsAdmin.graphql, transportsRouter.graphql]);

  useEffect(() => {
    dispatch(asyncGetIntrospectionStatus());
  }, [dispatch]);

  const isEnabled = useCallback(
    (str: string) => {
      return enabledModules.find((item) => item.moduleName === str);
    },
    [enabledModules]
  );

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
          {noSwagger ? null : (
            <Button color="primary" variant="outlined" onClick={() => setSwaggerModal(true)}>
              <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                <Image src={Swagger} alt="swagger" />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'SWAGGER'}
              </Typography>
            </Button>
          )}
          {noGraphQL ? null : (
            <Button color="primary" variant="outlined" onClick={() => setGraphQLOpen(true)}>
              <Icon sx={{ display: 'flex', alignContent: 'center' }}>
                <Image src={GraphQL} alt="graphQL" />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'GraphQL'}
              </Typography>
            </Button>
          )}
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
            {isEnabled('authentication') ? (
              <Grid item xs={12} md={6}>
                <LinkComponent href="/authentication/signIn" underline={'none'}>
                  <HomePageCard
                    icon={<SecretIcon />}
                    title="Set up an authentication method"
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
            ) : null}
            {isEnabled('database') ? (
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
            ) : null}
            {isEnabled('email') ? (
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
            ) : null}
            {isEnabled('router') ? (
              <Grid item xs={12} md={6}>
                <LinkComponent href="/router/security" underline={'none'}>
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
            ) : null}
            {isEnabled('database') ? (
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
            ) : null}
          </Grid>
          <SwaggerModal
            open={swaggerModal}
            setOpen={setSwaggerModal}
            swagger="App"
            title="App"
            baseUrl={SERVICE_API}
            adminUrl={CONDUIT_API}
            transportsAdmin={transportsAdmin}
            transportsRouter={transportsRouter}
          />
          <GraphQLModal
            open={graphQLOpen}
            setOpen={setGraphQLOpen}
            graphQl="App"
            title="App"
            baseUrl={SERVICE_API}
            adminUrl={CONDUIT_API}
            transportsAdmin={transportsAdmin}
            transportsRouter={transportsRouter}
          />
        </Container>
      </div>
    </>
  );
};

export default Home;
