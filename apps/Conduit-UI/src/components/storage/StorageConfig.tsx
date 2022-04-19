import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IStorageConfig } from '../../models/storage/StorageModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncSaveStorageConfig } from '../../redux/slices/storageSlice';
import { ConfigSaveSection, ConfigContainer } from 'ui-components';

const StorageConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.storageSlice.data);

  const methods = useForm<IStorageConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { control, reset } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const handleCancel = () => {
    setEdit(!edit);
    reset(config);
  };

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const watchProvider = useWatch({
    control,
    name: 'provider',
  });

  const onSubmit = (data: IStorageConfig) => {
    setEdit(false);
    dispatch(asyncSaveStorageConfig(data));
  };

  const providers = [
    { label: 'Azure', value: 'azure' },
    { label: 'Google', value: 'google' },
    { label: 'Local', value: 'local' },
    { label: 'Aws S3', value: 'aws' },
  ];

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
              }}>
              <Typography variant={'h6'}>Activate Storage Module</Typography>
              <FormInputSwitch name={'active'} disabled={!edit} />
            </Box>
            <Divider sx={{ mt: 2, mb: 2, width: '100%' }} />
            <Grid container spacing={2} sx={{ pl: 4 }}>
              {isActive && (
                <>
                  <Grid item xs={12}>
                    <Typography variant={'h6'}>The provider to use for storage</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormInputSelect
                      disabled={!edit}
                      label={'Provider'}
                      name="provider"
                      options={providers?.map((template) => ({
                        label: template.label,
                        value: template.value,
                      }))}
                    />
                  </Grid>
                  <Divider sx={{ mt: 2, mb: 2, width: '100%' }} />
                  <Grid item spacing={1} container xs={12}>
                    {watchProvider === 'azure' && (
                      <Grid item xs={6}>
                        <FormInputText
                          name="azure.connectionString"
                          label="Connection String"
                          disabled={!edit}
                        />
                      </Grid>
                    )}
                    {watchProvider === 'google' && (
                      <>
                        <Grid item xs={6}>
                          <FormInputText
                            name="google.serviceAccountKeyPath"
                            label="Service Account Key Path"
                            disabled={!edit}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormInputText
                            name="google.bucketName"
                            label="Bucket Name"
                            disabled={!edit}
                          />
                        </Grid>
                      </>
                    )}
                    {watchProvider === 'aws' && (
                      <>
                        <Grid item xs={6}>
                          <FormInputText name="aws.region" label="Region" disabled={!edit} />
                        </Grid>
                        <Grid item xs={6}>
                          <FormInputText
                            name="google.secretAccessKey"
                            label="Secret Access Key"
                            disabled={!edit}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormInputText
                            name="google.accessKeyId"
                            label="Access Key Id"
                            disabled={!edit}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormInputText
                            name="google.accountId"
                            label="Account Id"
                            disabled={!edit}
                          />
                        </Grid>
                      </>
                    )}
                    {watchProvider === 'local' && (
                      <>
                        <Grid item xs={6}>
                          <FormInputText
                            name="local.storagePath"
                            label="Storage Path"
                            disabled={!edit}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default StorageConfig;
