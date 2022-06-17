import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { asyncLogin } from '../redux/slices/appAuthSlice';
import { Box, Fade, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import LoginIllustration from '../assets/svgs/LoginIllustration';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../components/common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../components/common/FormComponents/FormInputCheckbox';
import ConduitLogo from '../assets/svgs/conduitLogo.svg';
import Image from 'next/image';
import theme from '../theme';

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
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const methods = useForm<ILoginValues>({
    defaultValues: { username: '', password: '', remember: false },
  });

  useEffect(() => {
    if (token) {
      router.replace('/');
    }
  }, [router, token]);

  const handleLogin = (values: { username: string; password: string; remember: boolean }) => {
    dispatch(asyncLogin(values));
  };

  return (
    <Container
      maxWidth={false}
      sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}
      disableGutters>
      {smallScreen ? null : (
        <Grid
          container
          item
          sx={{
            background: '#1c1d30',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          maxWidth={'md'}>
          <LoginIllustration width={'90%'} />
        </Grid>
      )}
      <Grid
        container
        item
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        marginX={2}>
        <Fade timeout={1200} in>
          <Grid container display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Box marginBottom={5} display={'flex'}>
              <Image src={ConduitLogo} alt="conduit-logo" width={300} height={80} priority />
            </Box>
            <Grid
              container
              item
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{
                background: 'background.paper',
              }}>
              <Typography variant="h6">Sign in</Typography>
              <Container maxWidth="xs">
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(handleLogin)}>
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
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}>
                      <FormInputCheckBox name="remember" label="Remember me" />
                    </Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ whiteSpace: 'nowrap' }}>
                      Sign In
                    </Button>
                  </form>
                </FormProvider>
              </Container>
            </Grid>
          </Grid>
        </Fade>
      </Grid>
    </Container>
  );
};

export default Login;
