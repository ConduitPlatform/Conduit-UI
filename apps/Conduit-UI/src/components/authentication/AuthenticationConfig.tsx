import React, { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IAuthenticationConfig } from '../../models/authentication/AuthModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncUpdateAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';
import { Icon, Tooltip, useTheme } from '@mui/material';

const AuthenticationConfig: React.FC = () => {
  const theme = useTheme();
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

  const refreshTokens = useWatch({
    control,
    name: 'refreshTokens.enabled',
  });

  const accessTokensCookies = useWatch({
    control,
    name: 'accessTokens.setCookie',
  });

  const refreshTokenscookies = useWatch({
    control,
    name: 'refreshTokens.setCookie',
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
                    style={{ textDecoration: 'none' }}>
                    <Icon
                      sx={{
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.common.white
                            : theme.palette.common.black,
                      }}>
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
                  <Grid item xs={12}>
                    <Typography variant="h6">Access tokens</Typography>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.jwtSecret', { disabled: !edit })}
                      label="JWT Secret"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.expiryPeriod', { disabled: !edit })}
                      label="Expiry Period"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" pt={2}>
                      <Typography variant="body1" fontWeight={'bold'}>
                        Cookies
                      </Typography>
                      <FormInputSwitch
                        {...register('accessTokens.setCookie', { disabled: !edit })}
                        switchProps={{ sx: { ml: 1 } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.cookieOptions.domain', {
                        disabled: !edit || !accessTokensCookies,
                      })}
                      label="Domain"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.cookieOptions.sameSite', {
                        disabled: !edit || !accessTokensCookies,
                      })}
                      label="Same site"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.cookieOptions.maxAge', {
                        disabled: !edit || !accessTokensCookies,
                      })}
                      label="Max age"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('accessTokens.cookieOptions.path', {
                        disabled: !edit || !accessTokensCookies,
                      })}
                      label="Path"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'} mr={1}>
                        HTTP only
                      </Typography>
                      <FormInputSwitch
                        {...register('accessTokens.cookieOptions.httpOnly', {
                          disabled: !edit || !accessTokensCookies,
                        })}
                        switchProps={{ sx: { ml: 1 } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'} mr={1}>
                        Signed
                      </Typography>
                      <FormInputSwitch
                        {...register('accessTokens.cookieOptions.signed', {
                          disabled: !edit || !accessTokensCookies,
                        })}
                        switchProps={{ sx: { ml: 1 } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'} mr={1}>
                        Secure
                      </Typography>
                      <FormInputSwitch
                        {...register('accessTokens.cookieOptions.secure', {
                          disabled: !edit || !accessTokensCookies,
                        })}
                        switchProps={{ sx: { ml: 1 } }}
                      />
                    </Box>
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
                    <Typography px={3} variant={'h6'}>
                      Refresh Tokens
                    </Typography>
                    <FormInputSwitch {...register('refreshTokens.enabled', { disabled: !edit })} />
                  </Box>
                  <Grid container spacing={2} sx={{ padding: 3 }}>
                    {refreshTokens && (
                      <>
                        <Grid item container spacing={2} alignItems="center">
                          <Grid item md={6} xs={12}>
                            <FormInputText
                              {...register('accessTokens.expiryPeriod', { disabled: !edit })}
                              label="Expiry Period"
                            />
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" pt={2}>
                            <Typography variant="body1" fontWeight={'bold'}>
                              Cookies
                            </Typography>
                            <FormInputSwitch
                              {...register('accessTokens.setCookie', { disabled: !edit })}
                              switchProps={{ sx: { ml: 1 } }}
                            />
                          </Box>
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <FormInputText
                            {...register('refreshTokens.cookieOptions.domain', {
                              disabled: !refreshTokens,
                            })}
                            label="Domain"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <FormInputText
                            {...register('refreshTokens.cookieOptions.sameSite', {
                              disabled: !edit,
                            })}
                            label="Same site"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <FormInputText
                            {...register('refreshTokens.cookieOptions.maxAge', {
                              disabled: !refreshTokens,
                            })}
                            label="Max age"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <FormInputText
                            {...register('refreshTokens.cookieOptions.path', {
                              disabled: !refreshTokens,
                            })}
                            label="Path"
                          />
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'} mr={1}>
                              HTTP only
                            </Typography>
                            <FormInputSwitch
                              {...register('refreshTokens.cookieOptions.httpOnly', {
                                disabled: !refreshTokens,
                              })}
                              switchProps={{ sx: { ml: 1 } }}
                            />
                          </Box>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'} mr={1}>
                              Signed
                            </Typography>
                            <FormInputSwitch
                              {...register('refreshTokens.cookieOptions.signed', {
                                disabled: !refreshTokens,
                              })}
                              switchProps={{ sx: { ml: 1 } }}
                            />
                          </Box>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <Box
                            width={'100%'}
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography variant={'subtitle1'} mr={1}>
                              Secure
                            </Typography>
                            <FormInputSwitch
                              {...register('refreshTokens.cookieOptions.secure', {
                                disabled: !refreshTokens,
                              })}
                              switchProps={{ sx: { ml: 1 } }}
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
