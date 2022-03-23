import React from 'react';
import { Box, Button, Container, Grid, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { INewAdminUser } from '../../models/settings/SettingsModels';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useDispatch } from 'react-redux';
import { asyncCreateAdminUser } from '../../redux/slices/settingsSlice';
import { FormProvider, useForm } from 'react-hook-form';
import PasswordStrengthMeter from '../common/FormComponents/PasswordStrengthMeter';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
    width: 300,
  },
  button: {
    marginTop: 16,
  },
  form: {
    maxWidth: 350,
  },
}));

const CreateNewUserTab: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const methods = useForm<INewAdminUser>({
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  const { reset } = methods;

  const handleRegister = (values: INewAdminUser) => {
    dispatch(asyncCreateAdminUser(values));
    reset();
  };
  const passwordValue = methods.watch('password');

  return (
    <Container>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant={'h5'} className={classes.title}>
            Create New User
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleRegister)} className={classes.form}>
              <FormInputText
                name="username"
                rules={{
                  required: 'Username is required',
                  minLength: { value: 5, message: 'Username should be 5 characters or longer' },
                }}
                label="Username"
              />
              <Box mt={2}>
                <FormInputText
                  typeOfInput="password"
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 5, message: 'Password should be 5 characters or longer' },
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
                className={classes.button}>
                Create New User
              </Button>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateNewUserTab;
