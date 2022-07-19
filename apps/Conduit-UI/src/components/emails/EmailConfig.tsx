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
  const { reset, control, register } = methods;

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
        <Grid item md={6} xs={12}>
          <FormInputSelect
            {...register('transport')}
            label="Transport Provider"
            options={providers.map((provider) => ({
              label: provider.label,
              value: provider.name,
            }))}
            disabled={!edit}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FormInputText {...register('sendingDomain')} label="Sending Domain" disabled={!edit} />
        </Grid>
        <Divider sx={{ marginTop: 3, width: '100%' }} />
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
              alignItems={'center'}
              mb={1}>
              <Typography variant={'h6'}>Activate Email Module</Typography>
              <FormInputSwitch {...register('active')} />
            </Box>
            <Grid container spacing={2} sx={{ pl: 4, mb: 1 }}>
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
