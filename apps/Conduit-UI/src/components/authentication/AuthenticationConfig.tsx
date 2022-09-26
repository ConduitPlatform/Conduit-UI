import React, { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
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
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';
import { Icon, Tooltip } from '@mui/material';

const AuthenticationConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.authenticationSlice.data);

  const methods = useForm<IAuthenticationConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { control, register } = methods;

  useEffect(() => {
    methods.reset(config);
  }, [methods, config]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const useCookies = useWatch({
    control,
    name: 'setCookies.enabled',
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

  const renderInputFields = useMemo(() => {
    type InputFieldTypes =
      | 'rateLimit'
      | 'tokenInvalidationPeriod'
      | 'refreshTokenInvalidationPeriod'
      | 'jwtSecret';

    const inputFields: InputFieldTypes[] = [
      'rateLimit',
      'tokenInvalidationPeriod',
      'refreshTokenInvalidationPeriod',
      'jwtSecret',
    ];

    return inputFields.map((field, index) => (
      <Grid key={index} item md={6} xs={12}>
        <FormInputText
          {...register(inputFields[index], { disabled: !edit })}
          label={startCase(camelCase(field))}
        />
      </Grid>
    ));
  }, [edit, register]);

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
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Authentication Module</Typography>
                <Tooltip title="Authentication configuration documentation">
                  <a
                    href="https://getconduit.dev/docs/modules/authentication/config"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'white' }}>
                    <Icon>
                      <InfoOutlined />
                    </Icon>
                  </a>
                </Tooltip>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            <Grid container spacing={2} sx={{ padding: 3 }}>
              {isActive && (
                <>
                  {renderInputFields}
                  <Grid item container spacing={1}>
                    <Grid item container>
                      <Box
                        width={'100%'}
                        display={'inline-flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}>
                        <Typography variant={'subtitle1'} mr={1}>
                          Generate Refresh Tokens
                        </Typography>
                        <FormInputSwitch
                          {...register('generateRefreshToken', { disabled: !edit })}
                          switchProps={{ sx: { ml: 1 } }}
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
                          Multiple User Sessions per Client
                        </Typography>
                        <FormInputSwitch
                          {...register('clients.multipleUserSessions', { disabled: !edit })}
                          switchProps={{ sx: { ml: 1 } }}
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
                          User can be logged in to multiple Clients
                        </Typography>
                        <FormInputSwitch
                          {...register('clients.multipleClientLogins', { disabled: !edit })}
                          switchProps={{ sx: { ml: 1 } }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
            {isActive && (
              <>
                <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
                <Grid container>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant={'h6'}>Use cookies</Typography>
                    <FormInputSwitch {...register('setCookies.enabled', { disabled: !edit })} />
                  </Box>
                  <Grid container spacing={2} sx={{ padding: 3 }}>
                    {useCookies && (
                      <>
                        <Grid key={0} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'}>httpOnly</Typography>
                            <FormInputSwitch
                              {...register('setCookies.options.httpOnly', { disabled: !edit })}
                            />
                          </Box>
                        </Grid>
                        <Grid key={1} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'}>secure</Typography>
                            <FormInputSwitch
                              {...register('setCookies.options.secure', { disabled: !edit })}
                            />
                          </Box>
                        </Grid>
                        <Grid key={2} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'}>signed</Typography>
                            <FormInputSwitch
                              {...register('setCookies.options.signed', { disabled: !edit })}
                            />
                          </Box>
                        </Grid>
                        <Grid key={3} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <FormInputText
                              typeOfInput={'number'}
                              {...register('setCookies.options.maxAge', { disabled: !edit })}
                              label={startCase(camelCase('maxAge'))}
                            />
                          </Box>
                        </Grid>
                        <Grid key={4} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <FormInputText
                              {...register('setCookies.options.domain', { disabled: !edit })}
                              label={startCase(camelCase('domain'))}
                            />
                          </Box>
                        </Grid>
                        <Grid key={5} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <FormInputText
                              {...register('setCookies.options.path', { disabled: !edit })}
                              label={startCase(camelCase('path'))}
                            />
                          </Box>
                        </Grid>
                        <Grid key={6} item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <FormInputText
                              {...register('setCookies.options.sameSite', { disabled: !edit })}
                              label={startCase(camelCase('sameSite'))}
                            />
                          </Box>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              </>
            )}
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default AuthenticationConfig;
