import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { FC } from 'react';
import GraphQL from '../../../assets/svgs/graphQL.svg';
import Swagger from '../../../assets/svgs/swagger.svg';
import { Icon } from '@mui/material';
import Image from 'next/image';
import { useAppSelector } from '../../../redux/store';
import PacmanLoader from 'react-spinners/HashLoader';

interface Props {
  baseUrl: string;
  title: string;
  labels: { name: string; id: string }[];
  pathNames: string[];
  swagger: string;
  icon: JSX.Element;
  children: any;
}

const StyledLayout: FC<Props> = ({
  baseUrl,
  title,
  labels,
  pathNames,
  swagger,
  icon,
  children,
}) => {
  const { loading } = useAppSelector((state) => state.appSlice);

  return (
    <SharedLayout
      baseUrl={baseUrl}
      title={title}
      labels={labels}
      pathNames={pathNames}
      swagger={swagger}
      icon={icon}
      loader={<PacmanLoader speedMultiplier={2} color={'#07D9C4'} loading={loading} size={16} />}
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
