import { Container } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import {
  EmailConfig as IEmailConfig,
  ITransportSettings,
  MailgunSettings,
  MandrillSettings,
  SendgridSettings,
  SmtpSettings,
  TransportProviders,
} from '../../models/emails/EmailModels';
import TransportSettings from './TransportSettings';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { isNil, isEmpty } from 'lodash';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { asyncUpdateEmailConfig } from '../../redux/slices/emailsSlice';
import ConfigSaveSection from '../common/ConfigSaveSection';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  typography: {
    marginBottom: theme.spacing(4),
  },
  innerGrid: {
    paddingLeft: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  menuItem: {
    textTransform: 'capitalize',
  },
  muiSelect: {
    textTransform: 'capitalize',
  },
}));

const transportProviders: ('mailgun' | 'smtp' | 'mandrill' | 'sendgrid')[] = [
  'mailgun',
  'smtp',
  'mandrill',
  'sendgrid',
];

const EmailConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.emailsSlice.data);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);

  const initialSettingsState = {
    active: false,
    sendingDomain: '',
    transport: TransportProviders.smtp,
    transportSettings: {
      mailgun: {
        apiKey: '',
        domain: '',
        host: '',
      },
      smtp: {
        port: '',
        host: '',
        auth: {
          username: '',
          password: '',
          method: '',
        },
      },
      mandrill: {
        apiKey: '',
      },
      sendgrid: {
        apiUser: '',
      },
    },
  };
  const [settingsState, setSettingsState] = useState<IEmailConfig>(initialSettingsState);

  const initializeSettings = useCallback(
    (prevState) => {
      let settingsObj: IEmailConfig = { ...prevState };

      transportProviders.forEach((provider) => {
        const providerSettings:
          | MailgunSettings
          | SmtpSettings
          | MandrillSettings
          | SendgridSettings = {
          ...settingsObj.transportSettings[provider],
          ...config.transportSettings[provider],
        };

        settingsObj.transportSettings = {
          ...settingsObj.transportSettings,
          [provider]: {
            ...providerSettings,
          },
        };
      });

      settingsObj = {
        ...settingsObj,
        active: config.active,
        sendingDomain: config.sendingDomain,
        transport: config.transport,
      };

      return settingsObj;
    },
    [config]
  );

  useEffect(() => {
    if (!config) {
      return;
    }
    setSettingsState((prevState) => initializeSettings(prevState));
  }, [initializeSettings, config]);

  const handleCancel = () => {
    setEdit(false);
    const initializedState = initializeSettings(initialSettingsState);
    setSettingsState(initializedState);
  };

  const onSaveClick = () => {
    const transportSettings = settingsState.transportSettings;
    const keys: TransportProviders[] = Object.keys(transportSettings) as TransportProviders[];
    let newTransportSettings: any = {};
    keys.forEach((k) => {
      if (!isNil(transportSettings[k]) && !isEmpty(transportSettings[k])) {
        newTransportSettings = { ...newTransportSettings, [k]: transportSettings[k] };
      } else {
        newTransportSettings = { ...newTransportSettings, [k]: null };
      }
    });
    const emailConfig: IEmailConfig = {
      ...settingsState,
      transportSettings: newTransportSettings,
    };
    dispatch(asyncUpdateEmailConfig(emailConfig));
    setOpenSaveDialog(false);
  };

  const onChange = (
    value: string,
    key: string,
    provider: TransportProviders,
    authItem?: string
  ) => {
    if (authItem) {
      const smtpProvider: SmtpSettings = settingsState.transportSettings[provider] as SmtpSettings;
      if (!smtpProvider) {
        return;
      }
      const newSettings: ITransportSettings = {
        ...settingsState.transportSettings,
        smtp: {
          ...smtpProvider,
          auth: {
            ...smtpProvider.auth,
            [authItem]: value,
          },
        },
      };
      setSettingsState({
        ...settingsState,
        transportSettings: newSettings,
      });
      return;
    }

    const newSettings = {
      ...settingsState.transportSettings,
      [provider]: {
        ...settingsState.transportSettings[provider],
        [key]: value,
      },
    };

    setSettingsState({
      ...settingsState,
      transportSettings: newSettings,
    });
  };

  const renderSettingsFields = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label=""
            disabled={!edit}
            value={settingsState.transport}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                transport: event.target.value as TransportProviders,
              });
            }}
            className={classes.muiSelect}
            helperText="Select your transport provider"
            variant="outlined">
            {transportProviders.map((provider, index) => (
              <MenuItem disabled={!edit} value={provider} key={index} className={classes.menuItem}>
                {provider}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Sending Domain"
            disabled={!edit}
            value={settingsState.sendingDomain}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                sendingDomain: event.target.value,
              });
            }}
            variant="outlined"
          />
        </Grid>
        <Divider className={classes.divider} />
        <TransportSettings edit={edit} data={settingsState} onChange={onChange} />
      </>
    );
  };

  return (
    <Container>
      <Paper className={classes.paper}>
        <Grid container>
          <Box
            width={'100%'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <Typography variant={'h6'}>Email Settings Module</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settingsState.active}
                  onChange={() =>
                    setSettingsState({
                      ...settingsState,
                      active: !settingsState.active,
                    })
                  }
                  value={'active'}
                  color="primary"
                  disabled={!edit}
                />
              }
              label={''}
            />
          </Box>

          <Divider className={classes.divider} />

          <Grid container spacing={2} className={classes.innerGrid}>
            {settingsState.active && renderSettingsFields()}
          </Grid>
          <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
        </Grid>
      </Paper>
      <ConfirmationDialog
        open={openSaveDialog}
        handleClose={() => setOpenSaveDialog(false)}
        title={'Are you sure you want to proceed?'}
        description={'Provider settings changed'}
        buttonAction={onSaveClick}
        buttonText={'Proceed'}
      />
    </Container>
  );
};

export default EmailConfig;
