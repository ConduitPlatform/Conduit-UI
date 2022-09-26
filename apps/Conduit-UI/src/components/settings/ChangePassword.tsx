import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { IPasswordChange } from '../../models/settings/SettingsModels';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import PasswordStrengthMeter from '../common/FormComponents/PasswordStrengthMeter';
import { asyncChangePassword } from '../../redux/slices/settingsSlice';

const ChangePassword: React.FC = () => {
  const dispatch = useDispatch();
  const methods = useForm<IPasswordChange>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { reset, register } = methods;

  const handleChangePassword = (values: IPasswordChange) => {
    dispatch(asyncChangePassword(values));
    reset();
  };
  const passwordValue = methods.watch('newPassword');

  return (
    <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
      <Grid item xs={12}>
        <Typography textAlign="center" variant={'h5'} mb={2}>
          Change your password
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleChangePassword)}>
              <FormInputText
                {...register('oldPassword', { required: 'Your old password is required' })}
                label="Old password"
                typeOfInput="password"
              />
              <Box mt={2}>
                <FormInputText
                  {...register('newPassword', {
                    required: 'password is required',
                    minLength: {
                      value: 5,
                      message: 'Password should be 5 characters or longer',
                    },
                  })}
                  typeOfInput="password"
                  label="New password"
                />
              </Box>
              <Box mt={2}>
                <FormInputText
                  {...register('confirmPassword', {
                    required: 'Password must be confirmed',
                    validate: {
                      matchesPreviousPassword: (value) => {
                        const { newPassword } = methods.getValues();
                        return newPassword === value || 'Passwords should match!';
                      },
                    },
                  })}
                  typeOfInput="password"
                  label="Confirm new password"
                />
              </Box>
              <Box my={2}>
                {passwordValue ? <PasswordStrengthMeter password={passwordValue} /> : undefined}
              </Box>
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 1 }}>
                Submit
              </Button>
            </form>
          </FormProvider>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChangePassword;
