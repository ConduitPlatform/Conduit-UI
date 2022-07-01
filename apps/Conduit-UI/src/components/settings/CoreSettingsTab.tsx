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

const selectOptions = [
  { value: 'development', label: 'development' },
  { value: 'production', label: 'production' },
  { value: 'test', label: 'test' },
];

const CoreSettingsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { coreSettings, adminSettings } = useAppSelector((state) => state.settingsSlice);
  const [editEnv, setEditEnv] = useState(false);
  const [edit, setEdit] = useState(false);
  const [env, setEnv] = useState('');

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
    setEdit(false);
    dispatch(asyncUpdateAdminSettings(data));
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
      <Grid container justifyContent={'center'}>
        <Paper sx={{ p: 4, borderRadius: 8 }}>
          <form onSubmit={onSaveClickEnv}>
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
          </form>
          <Divider sx={{ marginY: 2 }} />
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSaveClick)}>
              <Typography variant={'h6'} sx={{ mb: 1, mt: 3 }}>
                Administrative Routing
              </Typography>
              <Grid item xs={12} sx={{ marginY: 2 }} container wrap={'nowrap'}>
                <FormInputText name="hostUrl" label="URL" disabled={!edit} />
              </Grid>
              <Grid container item spacing={1} alignItems={'center'} mb={1}>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>REST:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8} container alignItems={'center'}>
                    <FormInputSwitch
                      name="transports.rest"
                      disabled
                      switchProps={{ sx: { mr: 1 } }}
                    />
                    <Tooltip
                      title={
                        "Conduit's administrative REST API may not be disabled via the Admin Panel at this time"
                      }
                      placement={'top'}
                      arrow>
                      <InfoOutlined fontSize={'small'} />
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>GraphQL:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8}>
                    <FormInputSwitch name="transports.graphql" disabled={!edit} />
                  </Grid>
                </Grid>
                <Grid item xs={12} container>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>WebSockets:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8}>
                    <FormInputSwitch name="transports.sockets" disabled={!edit} />
                  </Grid>
                </Grid>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>Hash Rounds:</Typography>
                  </Grid>
                  <Grid item>
                    <FormInputText name="auth.hashRounds" disabled={!edit} typeOfInput={'number'} />
                  </Grid>
                </Grid>{' '}
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>Token Expiration Time:</Typography>
                  </Grid>
                  <Grid item>
                    <FormInputText
                      name="auth.tokenExpirationTime"
                      disabled={!edit}
                      typeOfInput={'number'}
                    />
                  </Grid>
                </Grid>{' '}
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>Token Secret:</Typography>
                  </Grid>
                  <Grid item>
                    <FormInputText name="auth.tokenSecret" disabled={!edit} typeOfInput={'text'} />
                  </Grid>
                </Grid>
              </Grid>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </form>
          </FormProvider>
        </Paper>
      </Grid>
    </Container>
  );
};

export default CoreSettingsTab;
