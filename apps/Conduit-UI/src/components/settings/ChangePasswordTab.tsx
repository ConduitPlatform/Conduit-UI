import React from 'react';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { IPasswordChange } from '../../models/settings/SettingsModels';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import PasswordStrengthMeter from '../common/FormComponents/PasswordStrengthMeter';
import { asyncChangePassword } from '../../redux/slices/settingsSlice';

const ChangePasswordTab: React.FC = () => {
  const dispatch = useDispatch();
  const methods = useForm<IPasswordChange>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { reset } = methods;

  const handleChangePassword = (values: IPasswordChange) => {
    dispatch(asyncChangePassword(values));
    reset();
  };
  const passwordValue = methods.watch('newPassword');

  return (
    <Container maxWidth="md">
      <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ padding: 4, borderRadius: 8 }}>
          <Grid item xs={12}>
            <Typography textAlign="center" variant={'h5'} mb={2}>
              Change your password
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleChangePassword)}>
                  <FormInputText
                    typeOfInput="password"
                    name="oldPassword"
                    rules={{
                      required: 'Your old password is required',
                    }}
                    label="Old password"
                  />
                  <Box mt={2}>
                    <FormInputText
                      typeOfInput="password"
                      name="newPassword"
                      rules={{
                        required: 'Password is required',
                        minLength: {
                          value: 5,
                          message: 'Password should be 5 characters or longer',
                        },
                      }}
                      label="New password"
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
                            const { newPassword } = methods.getValues();
                            return newPassword === value || 'Passwords should match!';
                          },
                        },
                      }}
                      label="Confirm new password"
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

export default ChangePasswordTab;
