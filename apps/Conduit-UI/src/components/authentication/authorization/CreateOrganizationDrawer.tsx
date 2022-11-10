import { ArrowForwardIos, Save } from '@mui/icons-material';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../common/FormComponents/FormInputText';
import Organization from '../../../assets/svgs/organization.svg';
import Image from 'next/image';
import { FormInputSelect } from '../../common/FormComponents/FormInputSelect';

interface NewOrganizationInputs {
  type: string;
  name: string;
}

const defaultValues = {
  type: 'organization',
  name: '',
};

const CreateOrganizationDrawer = () => {
  const methods = useForm<NewOrganizationInputs>({ defaultValues: defaultValues });
  const { register } = methods;

  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <Box>
      <Container
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        maxWidth="sm">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box py={3} display="flex" alignItems="center" flexDirection="column" gap={12}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
                <Typography>I want to create a</Typography>
                <FormInputSelect
                  {...register('type', {
                    required: 'Email is required',
                  })}
                  options={[
                    { label: 'Organization', value: 'organization' },
                    { label: 'Group', value: 'group' },
                  ]}
                  textFieldProps={{ fullWidth: false }}
                  label="Type of Authorization group"
                />
              </Box>

              <FormInputText
                {...register('name', {
                  required: 'Password is required',
                })}
                textFieldProps={{ placeholder: 'Organization name...' }}
                label="Organization name"
                typeOfInput={'text'}
              />
              <Box>
                <Box textAlign="center" p={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForwardIos />}>
                    Create
                  </Button>
                </Box>
                <Typography textAlign="center" variant="caption">
                  Proceed with the creation of your organization / team to manage roles / add users
                  / create sub-teams
                </Typography>
              </Box>
            </Box>
          </form>
        </FormProvider>
      </Container>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}>
        <Image src={Organization} width="200px" alt="organization" />
      </Box>
    </Box>
  );
};

export default CreateOrganizationDrawer;
