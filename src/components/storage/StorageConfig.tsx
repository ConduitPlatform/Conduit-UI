import React, { useEffect, useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Container } from '@mui/material';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IStorageConfig } from '../../models/storage/StorageModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncSaveStorageConfig } from '../../redux/slices/storageSlice';
import ConfigSaveSection from '../common/ConfigSaveSection';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  innerGrid: {
    paddingLeft: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  formControl: {
    minWidth: 250,
  },
  actions: {
    paddingTop: theme.spacing(3),
  },
  buttonSpacing: {
    marginRight: theme.spacing(3),
  },
  box: {
    width: '100%',
    display: 'inline-flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const StorageConfig: React.FC = () => {
  const classes = useStyles();
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
  ];

  return (
    <Container>
      <Paper className={classes.paper}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container>
              <Box className={classes.box}>
                <Typography variant={'h6'}>Activate Storage Module</Typography>
                <FormInputSwitch name={'active'} disabled={!edit} />
              </Box>
              <Divider className={classes.divider} />
              <Grid container spacing={2} className={classes.innerGrid}>
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
                    <Divider className={classes.divider} />
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
      </Paper>
    </Container>
  );
};

export default StorageConfig;
