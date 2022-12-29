import React, { useMemo } from 'react';
import { Box, Button, Icon, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import GraphQL from '../../assets/svgs/graphQL.svg';
import Swagger from '../../assets/svgs/swagger.svg';
import { useState } from 'react';
import { useAppSelector } from '../../redux/store';
import { GraphQLModal, SwaggerModal } from '@conduitplatform/ui-components';
import { Description } from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);
  const [graphQLOpen, setGraphQLOpen] = useState<boolean>(false);
  const SERVICE_API = useAppSelector((state) => state.routerSlice?.data?.config?.hostUrl);
  const CONDUIT_API = useAppSelector((state) => state.settingsSlice?.adminSettings?.hostUrl);
  const transportsAdmin = useAppSelector((state) => state.settingsSlice?.adminSettings?.transports);
  const transportsRouter = useAppSelector((state) => state.routerSlice?.data?.config?.transports);

  const noSwagger = useMemo(() => {
    return !transportsRouter.rest && !transportsAdmin.rest;
  }, [transportsAdmin.rest, transportsRouter.rest]);

  const noGraphQL = useMemo(() => {
    return !transportsRouter.graphql && !transportsAdmin.graphql;
  }, [transportsAdmin.graphql, transportsRouter.graphql]);

  return (
    <Box
      p={2}
      display={'flex'}
      justifyContent="flex-end"
      alignItems={'flex-end'}
      flex={1}
      sx={{ marginBottom: '20px', gap: 2 }}>
      {noSwagger ? null : (
        <Button color="primary" variant="outlined" onClick={() => setSwaggerModal(true)}>
          <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
            <Image src={Swagger} alt="swagger" />
          </Icon>
          <Typography sx={{ ml: smallScreen ? 0 : 1, 'text-transform': 'none' }}>
            {smallScreen ? null : 'Swagger'}
          </Typography>
        </Button>
      )}
      {noGraphQL ? null : (
        <Button color="primary" variant="outlined" onClick={() => setGraphQLOpen(true)}>
          <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
            <Image src={GraphQL} alt="graphQL" />
          </Icon>
          <Typography sx={{ ml: smallScreen ? 0 : 1, 'text-transform': 'none' }}>
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
          <Description width={24} height={24} />
          <Typography sx={{ ml: smallScreen ? 0 : 1, 'text-transform': 'none' }}>
            {smallScreen ? null : 'Documentation'}
          </Typography>
        </Button>
      </a>
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
        title="App"
        baseUrl={SERVICE_API}
        adminUrl={CONDUIT_API}
        transportsAdmin={transportsAdmin}
        transportsRouter={transportsRouter}
      />
    </Box>
  );
};

export default Header;
