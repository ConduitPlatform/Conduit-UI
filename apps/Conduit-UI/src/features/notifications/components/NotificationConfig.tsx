import React, { FC, useEffect, useMemo, useState } from 'react';
import { Grid, Icon, Typography, useTheme } from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { INotificationConfig } from '../models/NotificationModels';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncSaveNotificationConfig } from '../store/notificationsSlice';
import { ConduitTooltip, ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';

const NotificationConfig: FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.notificationsSlice.data);

  const methods = useForm<INotificationConfig>({
    defaultValues: useMemo(() => {
      return {
        active: config.active,
        providerName: config.providerName,
        firebase: {
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail,
        },
        onesignal: {
          appId: config.onesignal.appId,
          apiKey: config.onesignal.apiKey,
        },
      };
    }, [config]),
  });
  const { reset, control, setValue, register } = methods;

  useEffect(() => {
    reset(config);
  }, [reset, config]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const hasProvider = useWatch({
    control,
    name: 'providerName',
  });

  const handleCancel = () => {
    setEdit(!edit);
    reset();
  };

  const onSubmit = (data: INotificationConfig) => {
    setEdit(false);
    const configToSave: INotificationConfig = {
      active: data.active,
      providerName: data.providerName,
      firebase: undefined,
      onesignal: undefined,
    };
    if (data.providerName === 'firebase' && data.firebase !== undefined) {
      configToSave.firebase = {
        projectId: data.firebase.projectId,
        privateKey: data.firebase.privateKey,
        clientEmail: data.firebase.clientEmail,
      };
    } else if (data.onesignal !== undefined) {
      configToSave.onesignal = {
        appId: data.onesignal.appId,
        apiKey: data.onesignal.apiKey,
      };
    }
    dispatch(asyncSaveNotificationConfig(configToSave));
  };

  const handleFileChange = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const jsonToObject = JSON.parse(event.target.result);

        if (
          'project_id' in jsonToObject &&
          'private_key' in jsonToObject &&
          'client_email' in jsonToObject
        ) {
          setValue('firebase.projectId', jsonToObject.project_id);
          setValue('firebase.privateKey', jsonToObject.private_key);
          setValue('firebase.clientEmail', jsonToObject.client_email);
        }
      }
    };
  };

  const providers = [
    {
      name: 'firebase',
      label: 'Firebase',
    },
    {
      name: 'onesignal',
      label: 'OneSignal',
    },
    {
      name: 'basic',
      label: 'Basic',
    },
  ];

  const getFirebaseForm = () => {
    return (
      <>
        <Grid item xs={12}>
          <FormInputText
            {...register('firebase.projectId', { disabled: !edit })}
            label={'Project ID'}
          />
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            {...register('firebase.clientEmail', { disabled: !edit })}
            label={'Client Email'}
          />
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            {...register('firebase.privateKey', { disabled: !edit })}
            label="Private Key"
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Or
            </Typography>
            <Button variant="outlined" component="label" sx={{ width: '100%' }}>
              Upload JSON file
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Box>
        </Grid>
      </>
    );
  };

  const getOneSignalForm = () => {
    return (
      <>
        <Grid item xs={12}>
          <FormInputText {...register('onesignal.appId', { disabled: !edit })} label="App ID" />
        </Grid>
        <Grid item xs={12}>
          <FormInputText {...register('onesignal.apiKey', { disabled: !edit })} label="API Key" />
        </Grid>
      </>
    );
  };

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container>
            <Box
              sx={{
                width: '100%',
                display: 'inline-flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Push Notifications Module</Typography>
                <ConduitTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={2} p={2}>
                      <Typography variant="body2">
                        To see more information regarding the Push Notifications config, please
                        visit our docs
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        <a
                          href="https://getconduit.dev/docs/modules/push-notifications/config"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}>
                          <Button variant="outlined">Take me there</Button>
                        </a>
                      </Box>
                    </Box>
                  }>
                  <Icon
                    sx={{
                      display: 'flex',
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                    }}>
                    <InfoOutlined />
                  </Icon>
                </ConduitTooltip>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            {isActive && (
              <Grid container spacing={2} sx={{ mt: 3, pb: 2 }}>
                <Grid container item alignContent={'center'} md={6} xs={12}>
                  <FormInputSelect
                    {...register('providerName', { disabled: !edit })}
                    label={'Provider name'}
                    options={providers?.map((provider) => ({
                      label: provider.label,
                      value: provider.name,
                    }))}
                  />
                </Grid>
                {hasProvider && hasProvider === 'firebase' && getFirebaseForm()}
                {hasProvider && hasProvider === 'onesignal' && getOneSignalForm()}
              </Grid>
            )}
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};
export default NotificationConfig;
