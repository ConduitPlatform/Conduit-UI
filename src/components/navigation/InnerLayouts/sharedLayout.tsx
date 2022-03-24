import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, Icon } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SwaggerModal from '../../common/SwaggerModal';
import Image from 'next/image';
import Swagger from '../../../assets/svgs/swagger.svg';
import GraphQL from '../../../assets/svgs/graphQL.svg';

interface Props {
  pathNames: string[];
  swagger: string;
  icon: JSX.Element;
  labels: { name: string; id: string }[];
  title: string;
}

const SharedLayout: React.FC<Props> = ({ children, pathNames, swagger, icon, labels, title }) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [swaggerOpen, setSwaggerOpen] = useState<boolean>(false);

  useEffect(() => {
    const index = pathNames.findIndex((pathname: string) => pathname === router.pathname);
    setValue(index);
  }, [router.pathname, pathNames]);

  return (
    <Box sx={{ height: '100vh', p: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mt: 2 }} variant={'h4'}>
          {title}
          {title !== 'Settings' && (
            <>
              <Button
                color="secondary"
                sx={{ textDecoration: 'none', ml: 8 }}
                variant="outlined"
                startIcon={
                  <Icon style={{ display: 'flex', alignContent: 'center' }}>
                    <Image src={Swagger} alt="swagger" />
                  </Icon>
                }
                onClick={() => setSwaggerOpen(true)}>
                SWAGGER
              </Button>
              <a
                style={{ textDecoration: 'none', paddingLeft: 10 }}
                href={`${process.env.CONDUIT_URL}/graphql`}
                target="_blank"
                rel="noreferrer">
                <Button
                  color="secondary"
                  startIcon={
                    <Icon style={{ display: 'flex', alignContent: 'center' }}>
                      <Image src={GraphQL} alt="swagger" />
                    </Icon>
                  }
                  variant="outlined">
                  GraphQL
                </Button>
              </a>
            </>
          )}
        </Typography>
        <Tabs value={value} sx={{ mt: 2 }}>
          {labels.map((label: { name: string; id: string }, index: number) => {
            return (
              <Link href={pathNames[index]} passHref key={index}>
                <Tab
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
              </Link>
            );
          })}
        </Tabs>
        <SwaggerModal
          open={swaggerOpen}
          setOpen={setSwaggerOpen}
          title={title}
          icon={icon}
          swagger={swagger}
        />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default SharedLayout;
