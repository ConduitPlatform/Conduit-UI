import Head from 'next/head';
import React, { useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, useTheme, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchemaIcon from '@mui/icons-material/VerticalSplit';
import SecretIcon from '@mui/icons-material/VpnKey';
import { HomePageCard, LinkComponent } from '@conduitplatform/ui-components';
import { useAppSelector } from '../../redux/store';
import { ScreenSearchDesktopRounded, Security } from '@mui/icons-material';
import { IModule } from '../../models/appAuth';
import LogsComponent from '../logs/LogsComponent';
import { styled } from '@mui/material/styles';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';
import Header from './Header';

const Main = styled('main')(() => ({
  flexGrow: 1,
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const { introspectionStatus } = useAppSelector((state) => state.databaseSlice.data);
  const enabledModules = useAppSelector((state) => state.appAuthSlice?.data?.enabledModules);
  const { logsAvailable, metricsAvailable } = useAppSelector((state) => state.appSlice.info);

  const homePageFontSizeHeader = {
    fontSize: '2.5rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '2rem',
    },
  };

  const homePageFontSizeTitles = {
    fontSize: '1rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.7rem',
    },
  };

  const homePageFontSizeSubtitles = {
    fontSize: '0.8rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.6rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.5rem',
    },
  };

  const isEnabled = useCallback(
    (str: string) => {
      return enabledModules?.find((item: IModule) => item.moduleName === str);
    },
    [enabledModules]
  );

  return (
    <>
      <Head>
        <title>Conduit - App</title>
      </Head>
      <Header />
      <Box sx={{ height: '100vh', p: 2 }}>
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
        <Main>
          <Container maxWidth="xl" sx={{ marginBottom: 4 }}>
            {metricsAvailable ? (
              <Grid container spacing={2}>
                <Grid item container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <RequestsLatency module="home" modulesLength={enabledModules?.length} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <ModuleHealth module="core" />
                  </Grid>
                  {isEnabled('database') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount
                        title="Schemas"
                        expression="conduit_registered_schemas_total{imported='false'}[5m]"
                      />
                    </Grid>
                  )}
                  {isEnabled('database') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount
                        title="Endpoints"
                        expression="conduit_custom_endpoints_total[5m]"
                      />
                    </Grid>
                  )}
                  {isEnabled('chat') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount title="Chat Rooms" expression="conduit_chat_rooms_total[5m]" />
                    </Grid>
                  )}
                  {isEnabled('forms') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount title="Forms" expression="conduit_forms_total[5m]" />
                    </Grid>
                  )}
                  {isEnabled('email') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount
                        title="Email Templates"
                        expression="conduit_email_templates_total[5m]"
                      />
                    </Grid>
                  )}
                  {isEnabled('storage') && (
                    <Grid item xs={6} sm={3}>
                      <MetricCount title="Files" expression="conduit_files_total[5m]" />
                    </Grid>
                  )}
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <ExtractQueryRangeGraph
                    expression="sum(increase(conduit_admin_grpc_requests_total[10m]))"
                    graphTitle="Total Admin gRPC Requests"
                    label="Requests"
                    hasControls={false}
                    canZoom={false}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <ExtractQueryRangeGraph
                    expression="sum(increase(conduit_internal_grpc_requests_total[10m]))"
                    graphTitle="Internal gRPC Requests"
                    label="Requests"
                    hasControls={false}
                    canZoom={false}
                  />
                </Grid>
              </Grid>
            ) : null}
            <Grid pt={3} container spacing={2}>
              {isEnabled('authentication') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/authentication/signIn" underline={'none'}>
                    <HomePageCard
                      icon={<SecretIcon width={24} height={24} />}
                      title="Set up an authentication method"
                      titleFontSize={homePageFontSizeTitles}
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
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/database/schemas" underline={'none'}>
                    <HomePageCard
                      icon={<SchemaIcon width={24} height={24} />}
                      title="Create a schema"
                      titleFontSize={homePageFontSizeTitles}
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
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/email/config" underline={'none'}>
                    <HomePageCard
                      icon={<EmailIcon width={24} height={24} />}
                      title="Set up email provider"
                      titleFontSize={homePageFontSizeTitles}
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
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/router/security" underline={'none'}>
                    <HomePageCard
                      icon={<LockIcon width={24} height={24} />}
                      title="Set up client secrets"
                      titleFontSize={homePageFontSizeTitles}
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
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/database/introspection" underline={'none'}>
                    <HomePageCard
                      icon={<ScreenSearchDesktopRounded width={24} height={24} />}
                      title="Introspection"
                      titleFontSize={homePageFontSizeTitles}
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
              {isEnabled('router') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/settings/userSettings" underline={'none'}>
                    <HomePageCard
                      icon={<Security width={24} height={24} />}
                      title="Enable 2FA"
                      titleFontSize={homePageFontSizeTitles}
                      descriptionContent={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            height: '40px',
                            fontSize: homePageFontSizeSubtitles,
                            mb: 1,
                          }}>
                          Secure your account with Two Factor Authentication!
                        </Typography>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
            </Grid>
          </Container>
        </Main>
        {logsAvailable ? <LogsComponent module={'core'} /> : null}
      </Box>
    </>
  );
};

export default Home;
