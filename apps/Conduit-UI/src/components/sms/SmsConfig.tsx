import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ISmsConfig } from '../../models/sms/SmsModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { asyncPutSmsConfig } from '../../redux/slices/smsSlice';
import { ConfigContainer, ConfigSaveSection, RichTooltip } from '@conduitplatform/ui-components';
import { Box, Button, Icon } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const SmsConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.smsSlice.data);

  const methods = useForm<ISmsConfig>({
    defaultValues: useMemo(() => {
      return {
        active: config.active,
        providerName: config.providerName,
        twilio: {
          phoneNumber: config.twilio.phoneNumber,
          accountSID: config.twilio.accountSID,
          authToken: config.twilio.authToken,
          verify: {
            active: config.twilio.verify.active,
            serviceSid: config.twilio.verify.serviceSid,
          },
        },
      };
    }, [config]),
  });

  const { reset, control, register } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

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

  const onSubmit = (data: ISmsConfig) => {
    setEdit(false);
    const configData = {
      active: data.active,
      providerName: data.providerName,
      twilio: {
        phoneNumber: data.twilio.phoneNumber,
        accountSID: data.twilio.accountSID,
        authToken: data.twilio.authToken,
        verify: {
          active: data.twilio.verify.active,
          serviceSid: data.twilio.verify.serviceSid,
        },
      },
    };
    dispatch(asyncPutSmsConfig(configData));
  };

  const providers = [
    {
      name: 'twilio',
      label: 'Twilio',
    },
  ];

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
  };

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid container item xs={12} justifyContent="space-between" alignItems={'center'}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate SMS Module</Typography>
                <Box display="flex" onMouseOver={MouseOverTooltip} onMouseOut={MouseOutTooltip}>
                  <RichTooltip
                    content={
                      <Box display="flex" flexDirection="column" gap={2} p={2}>
                        <Typography variant="body2">
                          To see more information regarding the SMS config, please visit our docs
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                          <a
                            href="https://getconduit.dev/docs/modules/sms/config"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}>
                            <Button variant="outlined">Take me there</Button>
                          </a>
                        </Box>
                      </Box>
                    }
                    width="400px"
                    open={openTooltip}
                    onClose={MouseOutTooltip}>
                    <Icon>
                      <InfoOutlined />
                    </Icon>
                  </RichTooltip>
                </Box>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Grid>
            {isActive && (
              <>
                <Grid item md={6} xs={12}>
                  <FormInputSelect
                    {...register('providerName', { disabled: !edit })}
                    label={'Provider name'}
                    options={providers.map((provider) => ({
                      label: provider.name,
                      value: provider.name,
                    }))}
                  />
                </Grid>
                {hasProvider && (
                  <>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('twilio.phoneNumber', { disabled: !edit })}
                        label={'Phone Number'}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('twilio.accountSID', { disabled: !edit })}
                        label={'Account SID'}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('twilio.authToken', { disabled: !edit })}
                        label={'Auth Token'}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Typography variant="subtitle1">Verify:</Typography>
                      <FormInputSwitch
                        {...register('twilio.verify.active', { disabled: !edit })}
                        switchProps={{ sx: { ml: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormInputText
                        {...register('twilio.verify.serviceSid', { disabled: !edit })}
                        label={'Service SID'}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default SmsConfig;
