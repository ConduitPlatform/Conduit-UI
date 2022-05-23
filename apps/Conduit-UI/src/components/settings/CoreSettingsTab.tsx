import React, { useMemo } from 'react';
import { Grid, Container, Button, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ICoreSettings } from '../../models/settings/SettingsModels';
import { asyncUpdateCoreSettings } from '../../redux/slices/settingsSlice';

const CoreSettingsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { coreSettings } = useAppSelector((state) => state.settingsSlice);

  const methods = useForm<ICoreSettings>({
    defaultValues: useMemo(() => {
      return coreSettings;
    }, [coreSettings]),
  });

  const { reset } = methods;

  const onSaveClick = (data: ICoreSettings) => {
    dispatch(asyncUpdateCoreSettings(data));
  };

  const selectOptions = [
    { value: 'development', label: 'development' },
    { value: 'production', label: 'production' },
    { value: 'test', label: 'test' },
  ];

  return (
    <Container>
      <Grid container justifyContent={'center'}>
        <Paper sx={{ p: 4, borderRadius: 8 }}>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSaveClick)}>
              <Grid item xs={12}>
                <Typography variant={'h6'}>Core settings</Typography>
                <Typography variant={'subtitle1'}>
                  Below you can see information about the Conduit location
                </Typography>
              </Grid>
              <Grid item xs={12} mt={2} container alignItems={'center'}>
                <FormInputSelect name="env" label="Environment" options={selectOptions} />
              </Grid>
              <Grid item spacing={2} xs={12} sx={{ marginTop: 3 }} container wrap={'nowrap'}>
                <Grid
                  item
                  xs={12}
                  sm={8}
                  alignItems={'center'}
                  wrap={'nowrap'}
                  sx={{ marginRight: 4 }}>
                  <FormInputText name="hostUrl" label="URL" />
                </Grid>
                <Grid item xs={12} sm={4} alignItems={'center'} wrap={'nowrap'}>
                  <FormInputText name="port" label="Port" />
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: 4 }}>
                <Typography variant={'h6'}>Transport section</Typography>
              </Grid>
              <Grid item xs={12} container alignItems={'center'}>
                <Typography variant={'subtitle1'}>Toggle Rest:</Typography>
                <FormInputSwitch name="transports.rest.enabled" />
              </Grid>
              <Grid item xs={12} container alignItems={'center'}>
                <Typography variant={'subtitle1'}>Toggle GraphQL:</Typography>
                <FormInputSwitch name="transports.graphql.enabled" />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  sx={{ marginRight: 4 }}
                  placeholder={'Cancel'}
                  onClick={() => reset()}
                  variant={'contained'}>
                  Cancel
                </Button>
                <Button placeholder={'Save'} variant={'contained'} color={'primary'} type="submit">
                  Save
                </Button>
              </Grid>
            </form>
          </FormProvider>
        </Paper>
      </Grid>
    </Container>
  );
};

export default CoreSettingsTab;
