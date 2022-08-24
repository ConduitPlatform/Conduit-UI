import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import { IAdminSettings } from '../../../models/settings/SettingsModels';
import { IRouterConfig } from '../../../models/router/RouterModels';
import { useRouter } from 'next/router';
import { GraphQLModal, LinkComponent, SwaggerModal } from '@conduitplatform/ui-components';
import { ModulesTypes, moduleTitle } from '../../../models/logs/LogsModels';
import LogsComponent from '../../logs/LogsComponent';
import TerminalIcon from '@mui/icons-material/Terminal';

interface Props {
  pathNames: string[];
  swagger?: string;
  icon: JSX.Element;
  swaggerIcon: JSX.Element;
  graphQLIcon: JSX.Element;
  labels: { name: string; id: string }[];
  module: ModulesTypes;
  loader: JSX.Element;
  transportsAdmin: IAdminSettings['transports'];
  transportsRouter: IRouterConfig['transports'];
  noSwagger: boolean;
  noGraphQL: boolean;
  configActive?: boolean;
  SERVICE_API?: string;
  CONDUIT_API?: string;
}

const SharedLayout: FC<Props> = ({
  children,
  pathNames,
  swagger,
  icon,
  swaggerIcon,
  graphQLIcon,
  labels,
  module,
  loader,
  transportsAdmin,
  transportsRouter,
  noSwagger,
  noGraphQL,
  configActive,
  SERVICE_API,
  CONDUIT_API,
}) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [swaggerOpen, setSwaggerOpen] = useState<boolean>(false);
  const [graphQLOpen, setGraphQLOpen] = useState<boolean>(false);
  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!configActive) {
      setValue(labels.length - 1);
      return;
    }
    const index = pathNames.findIndex((pathname: string) => pathname === router.pathname);
    setValue(index);
  }, [router.pathname, pathNames]);

  const title = moduleTitle(module);

  const handleCloseLogs = () => {
    setLogsOpen(false);
  };

  const handleOpenLogs = () => {
    setLogsOpen(true);
  };

  return (
    <Box sx={{ height: '100vh', p: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center">
          <Typography variant={'h4'}>{title}</Typography>
          <Box display="flex" alignItems="center">
            {module !== 'settings' && (
              <Box whiteSpace={'nowrap'}>
                {noSwagger ? null : (
                  <Button
                    color="primary"
                    sx={{ textDecoration: 'none', ml: 2 }}
                    variant="outlined"
                    onClick={() => setSwaggerOpen(true)}>
                    {swaggerIcon}
                    <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                      {smallScreen ? null : 'SWAGGER'}
                    </Typography>
                  </Button>
                )}
                {noGraphQL ? null : (
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => setGraphQLOpen(true)}
                    sx={{ ml: 2 }}>
                    {graphQLIcon}
                    <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                      {smallScreen ? null : 'GraphQL'}
                    </Typography>
                  </Button>
                )}
              </Box>
            )}
            <Box px={3}>{loader}</Box>
          </Box>
          <Box display={'flex'} flex={1} justifyContent={'flex-end'}>
            <Tooltip title={'Logs'}>
              <IconButton onClick={handleOpenLogs}>
                <TerminalIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tabs value={value} indicatorColor="primary" sx={{ mt: 2 }}>
          {labels.map((label: { name: string; id: string }, index: number) => {
            const disabled = !configActive ? index < labels.length - 1 : false;
            return (
              <LinkComponent
                href={pathNames[index]}
                key={index}
                underline={'none'}
                color={'#FFFFFF'}
                disabled={disabled}>
                <Tab
                  disabled={disabled}
                  label={label.name}
                  id={label.id}
                  sx={
                    value === index
                      ? {
                          opacity: 1,
                          '&:hover': {
                            textDecoration: 'none',
                          },
                        }
                      : {
                          '&:hover': {
                            textDecoration: 'none',
                          },
                        }
                  }
                />
              </LinkComponent>
            );
          })}
        </Tabs>
        <SwaggerModal
          open={swaggerOpen}
          setOpen={setSwaggerOpen}
          title={title}
          icon={icon}
          swagger={swagger}
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
        <GraphQLModal
          open={graphQLOpen}
          setOpen={setGraphQLOpen}
          title={title}
          icon={icon}
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
        <LogsComponent module={module} open={logsOpen} onClose={handleCloseLogs} />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default SharedLayout;
