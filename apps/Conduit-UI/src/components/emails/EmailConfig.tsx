import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IEmailConfig } from '../../models/emails/EmailModels';
import TransportSettings from './TransportSettings';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { asyncUpdateEmailConfig } from '../../redux/slices/emailsSlice';
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';

const EmailConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.emailsSlice.data);
  const [edit, setEdit] = useState<boolean>(false);

  const methods = useForm<IEmailConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });
  const { reset, control } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const onSubmit = (data: IEmailConfig) => {
    setEdit(false);
    dispatch(asyncUpdateEmailConfig(data));
  };

  const providers = [
    {
      name: 'mailgun',
      label: 'Mailgun',
    },
    {
      name: 'smtp',
      label: 'Smtp',
    },
    {
      name: 'mandrill',
      label: 'Mandrill',
    },
    {
      name: 'sendgrid',
      label: 'Sendgrid',
    },
  ];

  const renderSettingsFields = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormInputSelect
            label=""
            name="transport"
            options={providers.map((provider) => ({
              label: provider.label,
              value: provider.name,
            }))}
            textFieldProps={{
              fullWidth: false,
              helperText: 'Select your transport provider',
            }}
            disabled={!edit}
          />
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            name="sendingDomain"
            label="Sending Domain"
            textFieldProps={{
              fullWidth: false,
            }}
            disabled={!edit}
          />
        </Grid>
        <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
        <TransportSettings data={config} control={control} disabled={!edit} />
      </>
    );
  };

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'h6'}>Activate Email Module</Typography>
              <FormInputSwitch name="active" />
            </Box>
            <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
            <Grid container spacing={2} sx={{ pl: 4 }}>
              {isActive && renderSettingsFields()}
            </Grid>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default EmailConfig;
