import React, { FC } from 'react';
import { Box, Button, Container, Dialog, Grid, Paper, Typography } from '@mui/material';
import { INewAdminUser } from '../../models/settings/SettingsModels';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useDispatch } from 'react-redux';
import { asyncCreateAdminUser } from '../../redux/slices/settingsSlice';
import { FormProvider, useForm } from 'react-hook-form';
import PasswordStrengthMeter from '../common/FormComponents/PasswordStrengthMeter';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateNewUserTab: FC<Props> = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const methods = useForm<INewAdminUser>({
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  const { reset } = methods;

  const handleRegister = (values: INewAdminUser) => {
    dispatch(asyncCreateAdminUser(values));
    reset();
    setOpen(false);
  };
  const passwordValue = methods.watch('password');

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Container maxWidth="md">
        <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{ padding: 3, borderRadius: 7 }}>
            <Grid item xs={12}>
              <Typography textAlign="center" variant={'h5'} mb={2}>
                Create New User
              </Typography>
            </Grid>
            <Grid item xs={12}>
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
                      {passwordValue ? (
                        <PasswordStrengthMeter password={passwordValue} />
                      ) : undefined}
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
    </Dialog>
  );
};

export default CreateNewUserTab;
