import Head from 'next/head';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import Box from '@material-ui/core/Box';
import {
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Theme,
  IconButton,
  Divider,
  Button,
  Link,
  SvgIcon,
  Icon,
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import SchemaIcon from '@material-ui/icons/VerticalSplit';
import SectetIcon from '@material-ui/icons/VpnKey';
import Description from '@material-ui/icons/Description';
import { ArrowForward } from '@material-ui/icons';
import SwaggerModal from '../components/common/SwaggerModal';
import GraphQL from '../assets/svgs/graphQL.svg';
import Swagger from '../assets/svgs/swagger.svg';
import Image from 'next/image';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      height: 125,
      width: 'auto',
      display: 'flex',
      padding: '20px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '8px',
      borderColor: theme.palette.primary.main,
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,

      color: '#fff',
      '&:hover': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme.palette.secondary.main,
      },
      '&:focus': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme.palette.secondary.main,
      },
    },
    iconButton: {
      color: theme.palette.secondary.main,
    },
    headerIcon: {
      color: theme.palette.secondary.main,
      marginLeft: '1px',
    },
    divider: {
      color: theme.palette.primary.main,
      marginBottom: '10px',
    },
    textIcon: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    welcomeTypography: {
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
    },
  })
);

const Home = () => {
  const classes = useStyles();
  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Conduit - App</title>
      </Head>
      <div>
        <Container maxWidth="xl">
          <Box
            p={2}
            display={'flex'}
            justifyContent="flex-end"
            alignItems={'flex-end'}
            flex={1}
            style={{ marginBottom: '20px', gap: 10 }}>
            <Button
              variant="outlined"
              startIcon={
                <Icon style={{ display: 'flex', alignContent: 'center' }}>
                  <Image src={Swagger} alt="swagger" />
                </Icon>
              }
              onClick={() => setSwaggerModal(true)}>
              SWAGGER
            </Button>
            <a
              style={{ textDecoration: 'none' }}
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
            <a
              href="https://getconduit.dev/docs/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}>
              <Button variant="outlined" startIcon={<Description />}>
                DOCUMENTATION
              </Button>
            </a>
          </Box>
        </Container>
        <Box
          p={2}
          display={'flex'}
          alignItems={'center'}
          flex={1}
          style={{ marginBottom: '200px' }}>
          <Typography variant={'h4'} className={classes.welcomeTypography}>
            Welcome to C
            <Slide timeout={1000} in direction={'down'}>
              <Typography variant={'h4'} component={'span'} role="img" aria-label="okhand">
                👌
              </Typography>
            </Slide>
            nduit!
          </Typography>
        </Box>

        <Container maxWidth="md">
          <Grid container spacing={6}>
            <Grid item sm={12} md={6}>
              <Paper className={classes.paper} variant="elevation">
                <div className={classes.textIcon}>
                  <SectetIcon className={classes.headerIcon} />
                  <Typography> &nbsp; set up an auth method</Typography>
                </div>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                  Easily login with the method of your choice!
                  <IconButton className={classes.iconButton} size="small">
                    <Link href="/authentication/signIn">
                      <ArrowForward />
                    </Link>
                  </IconButton>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className={classes.paper} variant="elevation">
                <div className={classes.textIcon}>
                  <SchemaIcon className={classes.headerIcon} />
                  <Typography align="center">&nbsp; create a schema</Typography>
                </div>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                  Create your schema with a user friendly UI!
                  <IconButton className={classes.iconButton} size="small">
                    <Link href="/database/schemas">
                      <ArrowForward />
                    </Link>
                  </IconButton>
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className={classes.paper} variant="elevation">
                <div className={classes.textIcon}>
                  <EmailIcon className={classes.headerIcon} />
                  <Typography> &nbsp;set up email provider</Typography>
                </div>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                  Select your preferred provider and start mailing!
                  <IconButton className={classes.iconButton} size="small">
                    <Link href="/email/config">
                      <ArrowForward />
                    </Link>
                  </IconButton>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={6}>
              <Paper className={classes.paper} variant="elevation">
                <div className={classes.textIcon}>
                  <LockIcon className={classes.headerIcon} />
                  <Typography>&nbsp; set up client secrets</Typography>
                </div>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                  Set up your client secret across multiple platforms!
                  <IconButton className={classes.iconButton} size="small">
                    <Link href="/settings/secrets">
                      <ArrowForward />
                    </Link>
                  </IconButton>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <SwaggerModal open={swaggerModal} setOpen={setSwaggerModal} swagger="App" title="App" />
        </Container>
      </div>
    </>
  );
};

export default Home;
