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

const NewUserModal: React.FC<Props> = ({ handleNewUserDispatch }) => {
  const methods = useForm<NewUserInputs>({ defaultValues: defaultValues });

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
              }}
              spacing={2}>
              <Grid item sm={12}>
                <FormInputText
                  name="email"
                  label="Username/Email"
                  rules={{ required: 'Username/mail is required' }}
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item sm={12}>
                <FormInputText
                  name="password"
                  label="Password"
                  rules={{ required: 'Password is required' }}
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

export default NewUserModal;
