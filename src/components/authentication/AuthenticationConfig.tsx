import { Container } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IAuthenticationConfig } from '../../models/authentication/AuthModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { camelCase, startCase } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncUpdateAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import ConfigSaveSection from '../common/ConfigSaveSection';

const AuthenticationConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);
  const { config } = useAppSelector((state) => state.authenticationSlice.data);
  const methods = useForm<IAuthenticationConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { control } = methods;

  useEffect(() => {
    methods.reset(config);
  }, [methods, config]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const handleCancel = () => {
    setEdit(!edit);
    methods.reset();
  };

  const onSubmit = (data: IAuthenticationConfig) => {
    setEdit(false);
    const body = {
      ...config,
      ...data,
    };
    dispatch(asyncUpdateAuthenticationConfig(body));
  };

  const inputFields = [
    'rateLimit',
    'tokenInvalidationPeriod',
    'refreshTokenInvalidationPeriod',
    'jwtSecret',
  ];

  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 4, color: 'text.secondary' }}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} style={{}}>
            <Grid container spacing={3}>
              <Box
                width={'100%'}
                display={'inline-flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'h6'}>Activate Authentication Module</Typography>
                <FormInputSwitch name={'active'} disabled={!edit} />
              </Box>
              <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
              <Grid container spacing={2} sx={{ padding: 3 }}>
                {isActive && (
                  <>
                    {inputFields.map((field, index) => (
                      <Grid key={index} item xs={6}>
                        <FormInputText
                          name={field}
                          label={startCase(camelCase(field))}
                          disabled={!edit}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={6}>
                      <Box
                        width={'100%'}
                        display={'inline-flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}>
                        <Typography variant={'subtitle1'}>
                          Allow Refresh Token generation
                        </Typography>
                        <FormInputSwitch name={'generateRefreshToken'} disabled={!edit} />
                      </Box>
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

export default AuthenticationConfig;
