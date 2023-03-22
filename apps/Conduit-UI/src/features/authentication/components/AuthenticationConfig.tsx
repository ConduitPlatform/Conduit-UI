import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { CaptchaProvider, IAuthenticationConfig } from '../models/AuthModels';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncUpdateAuthenticationConfig } from '../store/authenticationSlice';
import { ConduitTooltip, ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';
import { Icon, useTheme } from '@mui/material';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';

const captchaProviders = [CaptchaProvider.recaptcha, CaptchaProvider.hcaptcha];
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

  const refreshTokensCookies = useWatch({
    control,
    name: 'refreshTokens.setCookie',
  });

  const teamsEnabled = useWatch({
    control,
    name: 'teams.enabled',
  });

  const teamsInvitesEnabled = useWatch({
    control,
    name: 'teams.invites.enabled',
  });

  const captchaEnabled = useWatch({
    control,
    name: 'captcha.enabled',
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
                <ConduitTooltip title={'Authentication configuration documentation'}>
                  <a
                    href="https://getconduit.dev/docs/modules/authentication/config"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}>
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
                  </a>
                </ConduitTooltip>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            <Grid container spacing={2} sx={{ marginTop: 2, paddingX: 3 }}>
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
                    <FormInputSelect
                      label={'Same site'}
                      {...register('accessTokens.cookieOptions.sameSite', {
                        disabled: !edit,
                      })}
                      options={[
                        { label: 'None', value: 'None' },
                        { label: 'Lax', value: 'Lax' },
                        { label: 'Strict', value: 'Strict' },
                      ]}
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
                              {...register('refreshTokens.expiryPeriod', { disabled: !edit })}
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
                              {...register('refreshTokens.setCookie', { disabled: !edit })}
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
                          <FormInputSelect
                            label={'Same site'}
                            {...register('refreshTokens.cookieOptions.sameSite', {
                              disabled: !edit,
                            })}
                            options={[
                              { label: 'None', value: 'None' },
                              { label: 'Lax', value: 'Lax' },
                              { label: 'Strict', value: 'Strict' },
                            ]}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <FormInputText
                            {...register('refreshTokens.cookieOptions.path', {
                              disabled: !edit || !refreshTokens || !refreshTokensCookies,
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
                                disabled: !edit || !refreshTokens || !refreshTokensCookies,
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
                                disabled: !edit || !refreshTokens || !refreshTokensCookies,
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
                                disabled: !edit || !refreshTokens || !refreshTokensCookies,
                              })}
                              switchProps={{ sx: { ml: 1 } }}
                            />
                          </Box>
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
                  <Grid item xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography px={3} variant={'h6'}>
                        Service Accounts
                      </Typography>
                      <FormInputSwitch {...register('service.enabled', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />

                  <Grid item xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography px={3} variant={'h6'}>
                        Users Sessions
                      </Typography>
                    </Box>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography px={3}>Multiple active sessions per client</Typography>
                      <FormInputSwitch
                        {...register('clients.multipleUserSessions', { disabled: !edit })}
                      />
                    </Box>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography px={3}>Actives sessions from multiple clients</Typography>
                      <FormInputSwitch
                        {...register('clients.multipleClientLogins', { disabled: !edit })}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
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
                      Teams
                    </Typography>
                    <FormInputSwitch {...register('teams.enabled', { disabled: !edit })} />
                  </Box>
                  {teamsEnabled && (
                    <Grid container spacing={2} pt={3} pl={3}>
                      <Grid item xs={12}>
                        <Box
                          width={'100%'}
                          display={'inline-flex'}
                          justifyContent={'space-between'}
                          alignItems={'center'}>
                          <Typography variant={'subtitle1'} mr={1}>
                            Enable Default Team
                          </Typography>
                          <FormInputSwitch
                            {...register('teams.enableDefaultTeam', {
                              disabled: !edit,
                            })}
                            switchProps={{ sx: { ml: 1 } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          width={'100%'}
                          display={'inline-flex'}
                          justifyContent={'space-between'}
                          alignItems={'center'}>
                          <Typography variant={'subtitle1'} mr={1}>
                            Allow Add Without Invite
                          </Typography>
                          <FormInputSwitch
                            {...register('teams.allowAddWithoutInvite', {
                              disabled: !edit,
                            })}
                            switchProps={{ sx: { ml: 1 } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} mt={1}>
                        <Box
                          width={'100%'}
                          display={'inline-flex'}
                          justifyContent={'space-between'}
                          alignItems={'center'}>
                          <Typography variant="body1" fontWeight={'bold'}>
                            Invites
                          </Typography>
                          <FormInputSwitch
                            {...register('teams.invites.enabled', { disabled: !edit })}
                          />
                        </Box>
                      </Grid>
                      {teamsInvitesEnabled && (
                        <>
                          <Grid item xs={12} ml={2}>
                            <Box
                              width={'100%'}
                              display={'inline-flex'}
                              justifyContent={'space-between'}
                              alignItems={'center'}>
                              <Typography variant={'subtitle1'} mr={1}>
                                Send Email
                              </Typography>
                              <FormInputSwitch
                                {...register('teams.invites.sendEmail', {
                                  disabled: !edit,
                                })}
                                switchProps={{ sx: { ml: 1 } }}
                              />
                            </Box>
                          </Grid>
                          <Grid item container alignItems={'center'} ml={2}>
                            <Grid item md={4} xs={12}>
                              <Typography variant={'subtitle1'}>Invite URL</Typography>
                            </Grid>
                            <Grid item md={8} xs={12}>
                              <FormInputText
                                {...register('teams.invites.inviteUrl', { disabled: !edit })}
                                label="Invite URL"
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}
                </Grid>
              </>
            )}
            {isActive && (
              <>
                <Divider sx={{ marginTop: 2, marginBottom: 2, width: '100%' }} />
                <Grid container marginBottom={2}>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography px={3} variant={'h6'}>
                      Captcha
                    </Typography>
                    <FormInputSwitch {...register('captcha.enabled', { disabled: !edit })} />
                  </Box>

                  {captchaEnabled && (
                    <Grid container spacing={2} pt={3} pl={3}>
                      <Grid item container alignItems={'center'}>
                        <Grid item md={4} xs={12}>
                          <Typography variant={'subtitle1'} fontWeight={'bold'}>
                            Provider:
                          </Typography>
                        </Grid>
                        <Grid item md={8} xs={12}>
                          <FormInputSelect
                            label={''}
                            {...register('captcha.provider', { disabled: !edit })}
                            options={captchaProviders?.map((template) => ({
                              label: template,
                              value: template,
                            }))}
                          />
                        </Grid>
                      </Grid>

                      <Grid item xs={12} mt={1}>
                        <Typography variant="body1" fontWeight={'bold'}>
                          Platforms
                        </Typography>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Box
                          width={'100%'}
                          display={'inline-flex'}
                          justifyContent={'space-between'}
                          alignItems={'center'}>
                          <Typography variant={'subtitle1'} mr={1}>
                            Android
                          </Typography>
                          <FormInputSwitch
                            {...register('captcha.acceptablePlatform.android', {
                              disabled: !edit,
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
                            Web
                          </Typography>
                          <FormInputSwitch
                            {...register('captcha.acceptablePlatform.web', {
                              disabled: !edit,
                            })}
                            switchProps={{ sx: { ml: 1 } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} mt={1}>
                        <Typography variant="body1" fontWeight={'bold'}>
                          Routes
                        </Typography>
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Box
                          width={'100%'}
                          display={'inline-flex'}
                          justifyContent={'space-between'}
                          alignItems={'center'}>
                          <Typography variant={'subtitle1'} mr={1}>
                            Login
                          </Typography>
                          <FormInputSwitch
                            {...register('captcha.routes.login', {
                              disabled: !edit,
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
                            Register
                          </Typography>
                          <FormInputSwitch
                            {...register('captcha.routes.register', {
                              disabled: !edit,
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
                            oAuth2
                          </Typography>
                          <FormInputSwitch
                            {...register('captcha.routes.oAuth2', {
                              disabled: !edit,
                            })}
                          />
                        </Box>
                      </Grid>
                      <Grid item container alignItems={'center'} mt={1}>
                        <Grid item md={4} xs={12}>
                          <Typography variant={'subtitle1'}>Secret key:</Typography>
                        </Grid>
                        <Grid item md={8} xs={12}>
                          <FormInputText
                            {...register('captcha.secretKey', { disabled: !edit })}
                            label="Secret key"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
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
