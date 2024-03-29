import React from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import addTeam from '../../../assets/svgs/addTeam.svg';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Container from '@mui/material/Container';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { Box } from '@mui/material';
import { FormInputCheckBox } from '../../../components/common/FormComponents/FormInputCheckbox';
import { AuthTeam, AuthTeamFields } from '../models/AuthModels';

interface Props {
  data?: AuthTeam;
  handleSubmit: (values: { _id?: string } & AuthTeamFields) => void;
  parentTeam?: string;
}

const TeamDrawer: React.FC<Props> = ({ data, handleSubmit, parentTeam }) => {
  const methods = useForm<{ _id?: string } & AuthTeamFields>({
    defaultValues: { parentTeam: parentTeam, ...data },
  });
  const { register } = methods;

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
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
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
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
              <Grid item xs={12}>
                <FormInputText
                  disabled
                  {...register('parentTeam')}
                  label="Parent Team"
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormInputText
                  {...register('name', {
                    required: 'Name is required',
                  })}
                  label="Name"
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormInputCheckBox {...register('isDefault')} label="Default Team" />
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image src={addTeam} width="200px" height={'200px'} alt="addTeam" />
      </Box>
    </Box>
  );
};

export default TeamDrawer;
