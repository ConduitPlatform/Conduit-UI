import React, { useMemo } from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { FC } from 'react';
import GraphQL from '../../../assets/svgs/graphQL.svg';
import Swagger from '../../../assets/svgs/swagger.svg';
import { Icon } from '@mui/material';
import Image from 'next/image';
import { useAppSelector } from '../../../redux/store';
import ScaleLoader from 'react-spinners/ScaleLoader';

import { CONDUIT_API } from '../../../http/requestsConfig';

interface Props {
  title: string;
  labels: { name: string; id: string }[];
  pathNames: string[];
  swagger?: string;
  graphQL?: string;
  icon: JSX.Element;
  children: any;
}

const StyledLayout: FC<Props> = ({
  title,
  labels,
  pathNames,
  swagger,
  graphQL,
  icon,
  children,
}) => {
  const { loading } = useAppSelector((state) => state.appSlice);
  const transportsAdmin = useAppSelector((state) => state.settingsSlice?.adminSettings?.transports);
  const transportsRouter = useAppSelector((state) => state.securitySlice?.data?.config?.transports);

  const noSwagger = useMemo(() => {
    return !transportsRouter.rest && !transportsAdmin.rest;
  }, [transportsAdmin.rest, transportsRouter.rest]);

  const noGraphQL = useMemo(() => {
    return !transportsRouter.graphql && !transportsAdmin.graphql;
  }, [transportsAdmin.graphql, transportsRouter.graphql]);

  return (
    <SharedLayout
      baseUrl={CONDUIT_API}
      title={title}
      labels={labels}
      pathNames={pathNames}
      swagger={swagger}
      graphQL={graphQL}
      icon={icon}
      transportsAdmin={transportsAdmin}
      transportsRouter={transportsRouter}
      noSwagger={noSwagger}
      noGraphQL={noGraphQL}
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
        <Icon sx={{ display: 'flex', alignContent: 'center' }}>
          <Image src={Swagger} alt="swagger" />
        </Icon>
      }
      graphQLIcon={
        <Icon sx={{ display: 'flex', alignContent: 'center' }}>
          <Image src={GraphQL} alt="graphQL" />
        </Icon>
      }>
      {children}
    </SharedLayout>
  );
};

export default StyledLayout;
