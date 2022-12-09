import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IChatConfig } from '../models/ChatModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncPutChatConfig } from '../store/chatSlice';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { ConfigSaveSection, ConfigContainer, ConduitTooltip } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';
import { Divider, Icon, useTheme } from '@mui/material';

const ChatConfig: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.chatSlice);

  const methods = useForm<IChatConfig>({
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

  const explicitRoomJoins = useWatch({
    control,
    name: 'explicit_room_joins.enabled',
  });

  const handleCancel = () => {
    setEdit(!edit);
    methods.reset();
  };

  const onSubmit = (data: IChatConfig) => {
    setEdit(false);
    dispatch(asyncPutChatConfig(data));
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
                <Typography variant={'h6'}>Activate Chat Module</Typography>
                <ConduitTooltip title={'Chat configuration documentation'}>
                  <a
                    href="https://getconduit.dev/docs/modules/chat/config"
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
            <Grid container spacing={2} sx={{ paddingLeft: 4, mt: 1 }}>
              {isActive && (
                <>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Allow Message Edit</Typography>
                      <FormInputSwitch {...register('allowMessageEdit', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Allow Message Delete</Typography>
                      <FormInputSwitch {...register('allowMessageDelete', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Explicit Room Joins</Typography>
                      <FormInputSwitch
                        {...register('explicit_room_joins.enabled', { disabled: !edit })}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Send Email</Typography>
                      <FormInputSwitch
                        {...register('explicit_room_joins.send_email', {
                          disabled: !edit || !explicitRoomJoins,
                        })}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Send Notification</Typography>
                      <FormInputSwitch
                        {...register('explicit_room_joins.send_notification', {
                          disabled: !edit || !explicitRoomJoins,
                        })}
                      />
                    </Box>
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

export default ChatConfig;
