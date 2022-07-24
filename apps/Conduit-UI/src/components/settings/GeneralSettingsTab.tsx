import React, { useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Container,
  Paper,
  Tooltip,
  Divider,
  Select,
  SelectChangeEvent,
  InputLabel,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { IAdminSettings } from '../../models/settings/SettingsModels';
import {
  asyncUpdateAdminSettings,
  asyncUpdateCoreSettings,
} from '../../redux/slices/settingsSlice';
import { InfoOutlined } from '@mui/icons-material';
import { ConfigSaveSection } from '@conduitplatform/ui-components';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';

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
  const [env, setEnv] = useState<string>('');

  const methods = useForm<IAdminSettings>({
    defaultValues: useMemo(() => {
      return adminSettings;
    }, [adminSettings]),
  });

  const { reset } = methods;

  useEffect(() => {
    methods.reset(adminSettings);
  }, [adminSettings, methods]);

  useEffect(() => {
    setEnv(coreSettings.env);
  }, [coreSettings.env]);

  const handleCancel = () => {
    reset();
    setEdit(false);
  };

  const handleCancelEnv = () => {
    setEnv(coreSettings.env);
    setEditEnv(false);
  };

  const onSaveClick = (data: IAdminSettings) => {
    const finalData = {
      ...data,
      auth: {
        ...data.auth,
        hashRounds: parseInt(data.auth.hashRounds.toString()),
        tokenExpirationTime: parseInt(data.auth.tokenExpirationTime.toString()),
      },
    };
    setEdit(false);
    dispatch(asyncUpdateAdminSettings(finalData));
  };

  const onSaveClickEnv = () => {
    setEditEnv(false);
    dispatch(asyncUpdateCoreSettings({ env }));
  };

  const handleChangeEnv = (event: SelectChangeEvent) => {
    setEnv(event.target.value);
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Container maxWidth={'md'}>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <form onSubmit={onSaveClickEnv}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant={'h6'}>General</Typography>
              <Typography variant={'subtitle1'}>
                Below you can see information about the Conduit location
              </Typography>
            </Grid>
            <Grid item xs={12} mt={2} container alignItems={'center'} mb={1}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{capitalize(env)}</InputLabel>
                <Select
                  sx={{ borderRadius: 3 }}
                  value={env}
                  label={capitalize(env)}
                  disabled={!editEnv}
                  fullWidth
                  onChange={handleChangeEnv}>
                  <MenuItem value={selectOptions[0].value}>{selectOptions[0].label}</MenuItem>
                  <MenuItem value={selectOptions[1].value}>{selectOptions[1].label}</MenuItem>
                  <MenuItem value={selectOptions[2].value}>{selectOptions[2].label}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <ConfigSaveSection edit={editEnv} setEdit={setEditEnv} handleCancel={handleCancelEnv} />
          </Grid>
        </form>

        <Divider sx={{ marginY: 2 }} />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSaveClick)}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'h6'}>Administrative Routing</Typography>
              </Grid>
              <Grid item xs={12} sx={{ marginY: 2 }} container wrap={'nowrap'}>
                <FormInputText name="hostUrl" label="URL" disabled={!edit} />
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
                      <FormInputSwitch name={'transports.rest'} disabled />
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
                    <FormInputSwitch name={'transports.graphql'} disabled={!edit} />
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
                    <FormInputSwitch name={'transports.sockets'} disabled={!edit} />
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
                      name="auth.hashRounds"
                      disabled={!edit}
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
                      name="auth.tokenExpirationTime"
                      disabled={!edit}
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
                      name="auth.tokenSecret"
                      disabled={!edit}
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
