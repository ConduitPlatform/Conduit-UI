import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { asyncLogin } from '../redux/slices/appAuthSlice';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import LoginIllustration from '../assets/svgs/LoginIllustration';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../components/common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../components/common/FormComponents/FormInputCheckbox';
import ConduitLogo from '../assets/svgs/conduitLogo.svg';
import Image from 'next/image';

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
    <Container maxWidth="xl">
      <Grid container sx={{ height: '100vh' }}>
        <Grid container item xs={8} sx={{ background: '#262840', p: 4 }}>
          <LoginIllustration />
        </Grid>
        <Grid
          container
          item
          xs={4}
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'background.paper',
          }}>
          <Box marginBottom="20px">
            <Image src={ConduitLogo} alt="conduit-logo" />
          </Box>
          <Typography variant="h6">Sign in</Typography>
          <Container maxWidth="xs">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleLogin)} style={{ width: '100%' }}>
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
                <Box display="flex" justifyContent="flex-end">
                  <FormInputCheckBox name="remember" label="Remember me" />
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}>
                  Sign In
                </Button>
              </form>
            </FormProvider>
          </Container>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
