import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { asyncLogin } from '../redux/slices/appAuthSlice';
import { Box, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useRouter } from 'next/router';
import Grid from '@material-ui/core/Grid';
import LoginIllustration from '../assets/svgs/LoginIllustration';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../components/common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../components/common/FormComponents/FormInputCheckbox';
import ConduitLogo from '../assets/svgs/conduitLogo.svg';
import Image from 'next/image';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100vh',
  },
  paper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.background.paper,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  form: {
    width: '100%',
  },
  submit: {},
  snackBar: {
    maxWidth: '80%',
    width: 'auto',
  },
  illustrationContainer: {
    background: '#1F4068',
    padding: theme.spacing(4),
  },
}));

interface ILoginValues {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const { token } = useAppSelector((state) => state.appAuthSlice.data);
  const { loading } = useAppSelector((state) => state.appSlice);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const methods = useForm<ILoginValues>({
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (token) {
      router.replace('/');
    }
  }, [router, token]);

  const handleLogin = (values: { username: string; password: string; remember: boolean }) => {
    dispatch(asyncLogin(values));
  };

  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={8} className={classes.illustrationContainer}>
        <LoginIllustration />
      </Grid>
      <Grid container item xs={4} className={classes.paper}>
        <Box marginBottom="20px">
          <Image src={ConduitLogo} alt="conduit-logo" />
        </Box>
        <Typography variant="h5">Sign in</Typography>
        <Container maxWidth="xs">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleLogin)} className={classes.form}>
              <Box mt={2}>
                <FormInputText
                  name="username"
                  rules={{
                    required: 'Username is required',
                  }}
                  label="Username"
                />
              </Box>
              <Box mt={2}>
                <FormInputText
                  typeOfInput="password"
                  name="password"
                  rules={{
                    required: 'Password is required',
                  }}
                  label="Password"
                />
              </Box>
              <FormInputCheckBox name="remember" label="Remember me" />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={loading}>
                Sign In
              </Button>
            </form>
          </FormProvider>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Login;
