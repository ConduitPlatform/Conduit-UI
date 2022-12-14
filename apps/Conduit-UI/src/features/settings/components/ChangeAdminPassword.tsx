import { Box, Button, Container, Grid, Paper } from '@mui/material';
import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { IOtherAdminsPasswordChange } from '../models/SettingsModels';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import PasswordStrengthMeter from '../../../components/common/FormComponents/PasswordStrengthMeter';

interface Props {
  handleChangePassword: (password: string) => void;
}

const ChangeOtherAdminsPassword: FC<Props> = ({ handleChangePassword }) => {
  const methods = useForm<IOtherAdminsPasswordChange>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (values: IOtherAdminsPasswordChange) => {
    handleChangePassword(values.password);
  };

  const passwordValue = methods.watch('password');

  return (
    <Container maxWidth="md">
      <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ padding: 7, borderRadius: 7 }}>
          <Grid item xs={12} pt={10}>
            <Box display="flex" justifyContent="center">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
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
                    Change admin password
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

export default ChangeOtherAdminsPassword;
