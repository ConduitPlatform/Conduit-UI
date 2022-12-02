import React from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import addUser from '../../assets/svgs/addUser.svg';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Container from '@mui/material/Container';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { Box } from '@mui/material';
import { emailRegExp, passwordRegExp } from '../../utils/validations';

interface Props {
  handleNewUserDispatch: (values: { password: string; email: string }) => void;
}

interface NewUserInputs {
  email: string;
  password: string;
}

const defaultValues = {
  email: '',
  password: '',
};

const AddUserDrawer: React.FC<Props> = ({ handleNewUserDispatch }) => {
  const methods = useForm<NewUserInputs>({ defaultValues: defaultValues });
  const { register } = methods;

  const onSubmit = (data: { password: string; email: string }) => {
    handleNewUserDispatch(data);
  };

  return (
    <div>
      <Container
        sx={{
          flexGrow: 6,
          alignItems: 'center',
          justifyContent: 'center',
          justifyItems: 'center',
          justifySelf: 'center',
        }}
        maxWidth="sm">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid
              container
              alignItems="center"
              sx={{
                flexGrow: 6,
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
                justifySelf: 'center',
                mt: 10,
              }}
              spacing={2}>
              <Grid item sm={12}>
                <FormInputText
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: emailRegExp,
                      message: 'Not a valid e-mail!',
                    },
                  })}
                  label="Email"
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item sm={12}>
                <FormInputText
                  {...register('password', {
                    required: 'Password is required',
                    pattern: { value: passwordRegExp, message: 'Not a valid password' },
                  })}
                  textFieldProps={{
                    inputProps: {
                      autocomplete: 'new-password',
                      form: {
                        autocomplete: 'new-password',
                      },
                    },
                  }}
                  label="Password"
                  typeOfInput={'password'}
                />
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Container>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={addUser} width="200px" alt="addUser" />
      </Box>
    </div>
  );
};

export default AddUserDrawer;
