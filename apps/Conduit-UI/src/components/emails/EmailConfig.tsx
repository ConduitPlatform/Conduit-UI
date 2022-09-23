import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IEmailConfig } from '../../models/emails/EmailModels';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { asyncUpdateEmailConfig } from '../../redux/slices/emailsSlice';
import { ConfigContainer, ConfigSaveSection, RichTooltip } from '@conduitplatform/ui-components';
import { Button, Icon } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const EmailConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.emailsSlice.data);

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

  const transportProvider = useWatch({
    control,
    name: 'transport',
    defaultValue: 'smtp',
  });

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const onSubmit = useCallback(
    (data: IEmailConfig) => {
      setEdit(false);
      dispatch(asyncUpdateEmailConfig(data));
    },
    [dispatch]
  );

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
  };

  const renderSettingsFields = useMemo(() => {
    type FieldsTypes =
      | 'transportSettings.mailgun'
      | 'transportSettings.mailgun.apiKey'
      | 'transportSettings.mailgun.domain'
      | 'transportSettings.mailgun.host'
      | 'transportSettings.mailgun.proxy'
      | 'transportSettings.smtp'
      | 'transportSettings.smtp.port'
      | 'transportSettings.smtp.host'
      | 'transportSettings.smtp.auth'
      | 'transportSettings.smtp.auth.username'
      | 'transportSettings.smtp.auth.password'
      | 'transportSettings.smtp.auth.method'
      | 'transportSettings.mandrill'
      | 'transportSettings.mandrill.apiKey'
      | 'transportSettings.sendgrid'
      | 'transportSettings.sendgrid.apiKey';

    const fields: any = config?.transportSettings?.[transportProvider] ?? {};

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

    return (
      <>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport</Typography>
        </Grid>
        <Grid item md={6} xs={12}>
          <FormInputSelect
            {...register('transport', { disabled: !edit })}
            label="Transport Provider"
            options={providers.map((provider) => ({
              label: provider.label,
              value: provider.name,
            }))}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FormInputText
            {...register('sendingDomain', { disabled: !edit })}
            label="Sending Domain"
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <Divider sx={{ marginY: 2 }} variant={'fullWidth'} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport settings</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} item>
            {Object.keys(fields)?.map((field) => {
              if (transportProvider === 'smtp' && field === 'auth') {
                return Object.keys(fields?.[field])?.map((childField) => {
                  return (
                    <Grid item md={6} xs={12} key={`${childField}`}>
                      <FormInputText
                        {...register(`transportSettings.smtp.auth.${childField}` as FieldsTypes, {
                          disabled: !edit,
                        })}
                        label={childField}
                        key={childField}
                      />
                    </Grid>
                  );
                });
              }
              return (
                <Grid item md={6} xs={12} key={`${field}`}>
                  <FormInputText
                    {...register(`transportSettings.${transportProvider}.${field}` as FieldsTypes, {
                      disabled: !edit,
                    })}
                    label={field}
                    key={field}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </>
    );
  }, [config?.transportSettings, edit, register, transportProvider]);

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
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Email Module</Typography>
                <Box display="flex" onMouseOver={MouseOverTooltip} onMouseOut={MouseOutTooltip}>
                  <RichTooltip
                    content={
                      <Box display="flex" flexDirection="column" gap={2} p={2}>
                        <Typography variant="body2">
                          To see more information regarding the Email config, please visit our docs
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                          <a
                            href="https://getconduit.dev/docs/modules/email/config"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}>
                            <Button variant="outlined">Take me there</Button>
                          </a>
                        </Box>
                      </Box>
                    }
                    width="400px"
                    open={openTooltip}
                    onClose={MouseOutTooltip}>
                    <Icon>
                      <InfoOutlined />
                    </Icon>
                  </RichTooltip>
                </Box>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            <Grid container spacing={2} sx={{ pl: 4, mb: 1 }}>
              {isActive && renderSettingsFields}
            </Grid>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default EmailConfig;
