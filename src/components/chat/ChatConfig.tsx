import React, { useEffect, useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Container } from '@mui/material';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IChatConfig } from '../../models/chat/ChatModels';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncPutChatConfig } from '../../redux/slices/chatSlice';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
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
  box: {
    width: '100%',
    display: 'inline-flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subBox: {
    width: '50%',
    display: 'inline-flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const ChatConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.chatSlice);

  const methods = useForm<IChatConfig>({
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

  const onSubmit = (data: IChatConfig) => {
    setEdit(false);
    dispatch(asyncPutChatConfig(data));
  };

  return (
    <Container>
      <Paper className={classes.paper}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container>
              <Box className={classes.box}>
                <Typography variant={'h6'}>Activate Chat Module</Typography>
                <FormInputSwitch name={'active'} disabled={!edit} />
              </Box>
              <Divider className={classes.divider} />
              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && (
                  <>
                    <Grid item xs={12}>
                      <Box className={classes.subBox}>
                        <Typography variant={'subtitle1'}>Allow Message Edit</Typography>
                        <FormInputSwitch name={'allowMessageEdit'} disabled={!edit} />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box className={classes.subBox}>
                        <Typography variant={'subtitle1'}>Allow Message Delete</Typography>
                        <FormInputSwitch name={'allowMessageDelete'} disabled={!edit} />
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

export default ChatConfig;
