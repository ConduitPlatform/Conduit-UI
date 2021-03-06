import React, { useMemo } from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { FC } from 'react';
import GraphQL from '../../../assets/svgs/graphQL.svg';
import Swagger from '../../../assets/svgs/swagger.svg';
import { Icon } from '@mui/material';
import Image from 'next/image';
import { useAppSelector } from '../../../redux/store';
import ScaleLoader from 'react-spinners/ScaleLoader';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { CONDUIT_URL: CONDUIT_API },
} = getConfig();

interface Props {
  title: string;
  labels: { name: string; id: string }[];
  pathNames: string[];
  swagger?: string;
  icon: JSX.Element;
  configActive?: boolean;
}

const StyledLayout: FC<Props> = ({
  title,
  labels,
  pathNames,
  swagger,
  icon,
  configActive,
  children,
}) => {
  const { loading } = useAppSelector((state) => state.appSlice);
  const transportsAdmin = useAppSelector((state) => state.settingsSlice?.adminSettings?.transports);
  const transportsRouter = useAppSelector((state) => state.routerSlice?.data?.config?.transports);
  const SERVICE_API = useAppSelector((state) => state.routerSlice?.data?.config?.hostUrl);

  const noSwagger = useMemo(() => {
    return !transportsRouter.rest && !transportsAdmin.rest;
  }, [transportsAdmin.rest, transportsRouter.rest]);

  const noGraphQL = useMemo(() => {
    return !transportsRouter.graphql && !transportsAdmin.graphql;
  }, [transportsAdmin.graphql, transportsRouter.graphql]);

  return (
    <SharedLayout
      title={title}
      labels={labels}
      pathNames={pathNames}
      swagger={swagger}
      icon={icon}
      transportsAdmin={transportsAdmin}
      transportsRouter={transportsRouter}
      noSwagger={noSwagger}
      noGraphQL={noGraphQL}
      configActive={configActive}
      SERVICE_API={SERVICE_API}
      CONDUIT_API={CONDUIT_API}
      loader={
        <ScaleLoader
          speedMultiplier={3}
          color={'#07D9C4'}
          loading={loading}
          height={21}
          width={4}
        />
      }
      swaggerIcon={
        <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
          <Image src={Swagger} alt="swagger" />
        </Icon>
      }
      graphQLIcon={
        <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
          <Image src={GraphQL} alt="graphQL" />
        </Icon>
      }>
      {children}
    </SharedLayout>
  );
};

export default StyledLayout;
