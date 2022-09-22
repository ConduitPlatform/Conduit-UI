import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { asyncLogin, asyncverifyTwoFA } from '../../redux/slices/appAuthSlice';
import { Box, Fade, Paper, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import LoginIllustration from '../../assets/svgs/LoginIllustration';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';
import ConduitLogo from '../../assets/svgs/conduitLogo.svg';
import jwt_decode from 'jwt-decode';
import Image from 'next/image';
import key from '../../assets/svgs/key.svg';

interface ILoginValues {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const theme = useTheme();
  const { token } = useAppSelector((state) => state.appAuthSlice.data);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [authenticationCode, setAuthenticationCode] = useState<string>('');

  const methods = useForm<ILoginValues>({
    defaultValues: { username: '', password: '', remember: false },
  });

  useEffect(() => {
    if (token) {
      const decoded: { id: string; twoFaRequired: boolean; iat: number; exp: number } =
        jwt_decode(token);
      if (!decoded.twoFaRequired) router.replace('/');
    }
  }, [router, token]);

  const handleLogin = (values: { username: string; password: string; remember: boolean }) => {
    dispatch(asyncLogin(values));
  };

  const remember = methods.watch('remember');

  const username = methods.watch('username');
  const password = methods.watch('password');

  const handleTwoFALogin = () => {
    dispatch(asyncverifyTwoFA({ code: authenticationCode, remember, username }));
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
                      disabled={username === '' || password === ''}
                      sx={{ whiteSpace: 'nowrap' }}>
                      Sign In
                    </Button>
                  </form>
                </FormProvider>
                {token && jwt_decode(token).twoFaRequired && (
                  <Paper elevation={0} sx={{ borderRadius: 8 }}>
                    <Box mt={4} p={4} display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Typography textAlign="center">2FA Required!</Typography>
                        <Image src={key} alt="key" />
                      </Box>
                      <Typography textAlign="center">Please insert your 2FA code</Typography>
                      <TextField
                        label="Authentication Code"
                        value={authenticationCode}
                        onChange={(e) => setAuthenticationCode(e.target.value)}
                      />
                      <Button sx={{ textAlign: 'center' }} onClick={() => handleTwoFALogin()}>
                        Continue
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Container>
            </Grid>
          </Grid>
        </Fade>
      </Grid>
    </Container>
  );
};

export default Login;
