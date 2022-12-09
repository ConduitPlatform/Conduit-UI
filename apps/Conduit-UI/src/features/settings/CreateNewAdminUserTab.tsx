import React, { FC } from 'react';
import { Box, Button, Container, Grid, Paper } from '@mui/material';
import { INewAdminUser } from './SettingsModels';
import { FormInputText } from '../../components/common/FormComponents/FormInputText';
import { FormProvider, useForm } from 'react-hook-form';
import PasswordStrengthMeter from '../../components/common/FormComponents/PasswordStrengthMeter';

interface Props {
  handeAddNewUser: (user: INewAdminUser) => void;
}

const CreateNewAdminUserTab: FC<Props> = ({ handeAddNewUser }) => {
  const methods = useForm<INewAdminUser>({
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  const { reset } = methods;

  const handleRegister = (values: INewAdminUser) => {
    handeAddNewUser(values);
    reset();
  };
  const passwordValue = methods.watch('password');

  return (
    <Container maxWidth="md">
      <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ padding: 7, borderRadius: 7 }}>
          <Grid item xs={12} pt={10}>
            <Box display="flex" justifyContent="center">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleRegister)}>
                  <FormInputText
                    name="username"
                    rules={{
                      required: 'Username is required',
                      minLength: {
                        value: 5,
                        message: 'Username should be 5 characters or longer',
                      },
                    }}
                    label="Username"
                  />
                  <Box mt={2}>
                    <FormInputText
                      typeOfInput="password"
                      name="password"
                      rules={{
                        required: 'Password is required',
                        minLength: {
                          value: 5,
                          message: 'Password should be 5 characters or longer',
                        },
                      }}
                      label="Password"
                    />
                  </Box>
                  <Box mt={2}>
                    <FormInputText
                      typeOfInput="password"
                      name="confirmPassword"
                      rules={{
                        required: 'Password must be confirmed',
                        validate: {
                          matchesPreviousPassword: (value) => {
                            const { password } = methods.getValues();
                            return password === value || 'Passwords should match!';
                          },
                        },
                      }}
                      label="Confirm password"
                    />
                  </Box>
                  <Box my={2}>
                    {passwordValue ? <PasswordStrengthMeter password={passwordValue} /> : undefined}
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}>
                    Create New User
                  </Button>
                </form>
              </FormProvider>
            </Box>
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
};

export default CreateNewAdminUserTab;
