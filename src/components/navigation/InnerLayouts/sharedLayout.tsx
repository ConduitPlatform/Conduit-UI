import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, Icon } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SwaggerModal from '../../common/SwaggerModal';
import Image from 'next/image';
import Swagger from '../../../assets/svgs/swagger.svg';
import GraphQL from '../../../assets/svgs/graphQL.svg';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      height: '100vh',
      padding: theme.spacing(4),
    },
    navBar: {
      marginBottom: theme.spacing(2),
    },
    swaggerButton: {
      textDecoration: 'none',
      marginLeft: theme.spacing(8),
    },
    navContent: {
      marginTop: '10px',
    },
    link: {
      textDecoration: 'none',
      color: 'inherit',
    },
    tab: {
      '&:hover': {
        textDecoration: 'none',
      },
    },
    tabSelected: {
      opacity: 1,
      '&:hover': {
        textDecoration: 'none',
      },
    },
    graphQlButton: {
      marginLeft: theme.spacing(3),
    },
  })
);

interface Props {
  pathNames: string[];
  swagger: string;
  icon: JSX.Element;
  labels: { name: string; id: string }[];
  title: string;
}

const SharedLayout: React.FC<Props> = ({ children, pathNames, swagger, icon, labels, title }) => {
  const classes = useStyles();
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [swaggerOpen, setSwaggerOpen] = useState<boolean>(false);

  useEffect(() => {
    const index = pathNames.findIndex((pathname: string) => pathname === router.pathname);
    setValue(index);
  }, [router.pathname, pathNames]);

  return (
    <Box className={classes.root}>
      <Box className={classes.navBar}>
        <Typography className={classes.navContent} variant={'h4'}>
          {title}
          {title !== 'Settings' && (
            <>
              <Button
                className={classes.swaggerButton}
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
        <Tabs value={value} className={classes.navContent}>
          {labels.map((label: { name: string; id: string }, index: number) => {
            return (
              <Link href={pathNames[index]} passHref key={index}>
                <Tab
                  label={label.name}
                  id={label.id}
                  classes={{
                    root: value === index ? classes.tabSelected : classes.tab,
                  }}
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
