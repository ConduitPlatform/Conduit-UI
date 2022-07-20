import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Container, Paper, Tooltip, Divider } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { IAdminSettings, ICoreSettings } from '../../models/settings/SettingsModels';
import {
  asyncUpdateAdminSettings,
  asyncUpdateCoreSettings,
} from '../../redux/slices/settingsSlice';
import { InfoOutlined } from '@mui/icons-material';
import { ConfigSaveSection } from '@conduitplatform/ui-components';
import Box from '@mui/material/Box';
import { camelCase, startCase } from 'lodash';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';

const selectOptions = [
  { value: 'development', label: 'development' },
  { value: 'production', label: 'production' },
  { value: 'test', label: 'test' },
];

const GeneralSettingsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { coreSettings, adminSettings } = useAppSelector((state) => state.settingsSlice);
  const [editEnv, setEditEnv] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [env, setEnv] = useState<string>(coreSettings.env);

  const methodsAdmin = useForm<IAdminSettings>({
    defaultValues: useMemo(() => {
      return adminSettings;
    }, [adminSettings]),
  });

  const methodsCore = useForm<ICoreSettings>({
    defaultValues: useMemo(() => {
      return coreSettings;
    }, [coreSettings]),
  });

  const {
    reset: resetAdmin,
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
  } = methodsAdmin;
  const { reset: resetCore, register: registerCore, handleSubmit: handleSubmitCore } = methodsCore;

  useEffect(() => {
    resetAdmin(adminSettings);
  }, [adminSettings, resetAdmin]);

  useEffect(() => {
    resetCore(coreSettings);
  }, [coreSettings, resetCore]);

  useEffect(() => {
    if (coreSettings.env) setEnv(coreSettings.env);
  }, [coreSettings.env]);

  const handleCancel = () => {
    resetAdmin();
    setEdit(false);
  };

  const handleCancelEnv = () => {
    resetCore();
    setEditEnv(false);
  };

  const onSaveClick = useCallback(
    (data: IAdminSettings) => {
      const finalData = {
        ...data,
        auth: {
          ...data.auth,
          hashRounds: parseInt(data.auth.hashRounds?.toString()),
          tokenExpirationTime: parseInt(data.auth.tokenExpirationTime?.toString()),
        },
      };
      setEdit(false);
      dispatch(asyncUpdateAdminSettings(finalData));
    },
    [dispatch]
  );

  const onSaveClickEnv = useCallback(
    (data: ICoreSettings) => {
      setEditEnv(false);
      dispatch(asyncUpdateCoreSettings({ env: data.env }));
    },
    [dispatch]
  );

  return (
    <Container maxWidth={'md'}>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <FormProvider {...methodsCore}>
          <form onSubmit={handleSubmitCore(onSaveClickEnv)}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'h6'}>General</Typography>
                <Typography variant={'subtitle1'}>
                  Below you can see information about the Conduit location
                </Typography>
              </Grid>
              <Grid item xs={12} mt={2} container alignItems={'center'} mb={1}>
                <FormInputSelect
                  {...registerCore('env', { disabled: !editEnv })}
                  label={startCase(camelCase(env))}
                  options={selectOptions}
                />
              </Grid>
              <ConfigSaveSection
                edit={editEnv}
                setEdit={setEditEnv}
                handleCancel={handleCancelEnv}
              />
            </Grid>
          </form>
        </FormProvider>

        <Divider sx={{ marginY: 2 }} />
        <FormProvider {...methodsAdmin}>
          <form onSubmit={handleSubmitAdmin(onSaveClick)}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'h6'}>Administrative Routing</Typography>
              </Grid>
              <Grid item xs={12} sx={{ marginY: 2 }} container wrap={'nowrap'}>
                <FormInputText {...registerAdmin('hostUrl', { disabled: !edit })} label="URL" />
              </Grid>
              <Grid container item alignItems={'center'} mb={1} spacing={1}>
                <Grid item container>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant={'subtitle1'} mr={1}>
                      REST:
                    </Typography>
                    <Box display={'flex'} alignItems={'center'}>
                      <Tooltip
                        sx={{ mr: 1 }}
                        title={
                          "Conduit's administrative REST API may not be disabled via the Admin Panel at this time"
                        }
                        placement={'top'}
                        arrow>
                        <InfoOutlined fontSize={'small'} />
                      </Tooltip>
                      <FormInputSwitch {...registerAdmin('transports.rest', { disabled: true })} />
                    </Box>
                  </Box>
                </Grid>

                <Grid item container>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant={'subtitle1'} mr={1}>
                      GraphQL:
                    </Typography>
                    <FormInputSwitch
                      {...registerAdmin('transports.graphql', { disabled: !edit })}
                    />
                  </Box>
                </Grid>
                <Grid item container>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant={'subtitle1'} mr={1}>
                      WebSockets:
                    </Typography>
                    <FormInputSwitch
                      {...registerAdmin('transports.sockets', { disabled: !edit })}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant={'h6'} sx={{ mt: 2 }}>
                    Administrative Settings
                  </Typography>
                </Grid>
                <Grid item container alignItems={'center'}>
                  <Grid item md={4} xs={12}>
                    <Typography variant={'subtitle1'} noWrap>
                      Hash Rounds:
                    </Typography>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <FormInputText
                      {...registerAdmin('auth.hashRounds', { disabled: !edit })}
                      typeOfInput={'number'}
                      textFieldProps={{
                        margin: 'dense',
                        size: 'small',
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid item container alignItems={'center'}>
                  <Grid item md={4} xs={12}>
                    <Typography variant={'subtitle1'}>Token Expiration Time:</Typography>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <FormInputText
                      {...registerAdmin('auth.tokenExpirationTime', { disabled: !edit })}
                      typeOfInput={'number'}
                      textFieldProps={{
                        margin: 'dense',
                        size: 'small',
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item container alignItems={'center'}>
                  <Grid item md={4} xs={12}>
                    <Typography variant={'subtitle1'}>Token Secret:</Typography>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <FormInputText
                      {...registerAdmin('auth.tokenSecret', { disabled: !edit })}
                      textFieldProps={{
                        margin: 'dense',
                        size: 'small',
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default GeneralSettingsTab;
