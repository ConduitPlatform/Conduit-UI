import React, { useState } from 'react';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import makeStyles from '@mui/styles/makeStyles';
import { Button, InputLabel, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import {
  IAuthenticationConfig,
  SignInTypes,
  SocialNameTypes,
} from '../../models/authentication/AuthModels';
import { extractProviderIcon, extractProviderName } from '../../utils/extractProviderUtils';
import Image from 'next/image';

const useStyles = makeStyles((theme) => ({
  typography: {
    flex: 1,
  },
  statusEnabled: {
    color: theme.palette.secondary.main,
  },
  statusDisabled: {
    color: theme.palette.primary.main,
  },
}));

interface Props {
  name: SocialNameTypes;
  setAccProps: any;
  handleData: (type: SocialNameTypes, data: SignInTypes) => void;
  configData: IAuthenticationConfig;
  accProps: SignInTypes;
}

const ReusableAccordion: React.FC<Props> = ({
  setAccProps,
  name,
  handleData,
  configData,
  accProps,
}) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState<boolean>(false);

  const handleCancel = () => {
    if (configData && configData[name] && name !== 'google' && name !== 'facebook') {
      setAccProps(configData[name]);
    }

    if (configData && configData[name] && (name === 'google' || name === 'facebook')) {
      setAccProps({
        ...configData[name],
        OAuth2Flow: configData[name].redirect_uri && configData[name].clientSecret ? true : false,
        redirect_uri: configData[name].redirect_uri || '',
        clientSecret: configData[name].clientSecret || '',
      });
    }

    setExpanded(false);
  };

  const handleSubmit = (type: SocialNameTypes, data: SignInTypes) => {
    handleData(type, data);
  };

  const isFieldDisabled = (key?: string) => {
    if (name !== 'google' && name !== 'facebook') {
      if (accProps.enabled) return false;
      else return true;
    }
    if (name === 'google' || name === 'facebook') {
      if (accProps.enabled) {
        if (
          (key === 'redirect_uri' || key === 'clientSecret') &&
          accProps.OAuth2Flow === false &&
          accProps.enabled
        ) {
          return true;
        } else {
          return false;
        }
      } else return true;
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        cursor: 'default',
        '&.MuiAccordion-root.Mui-expanded': {
          marginTop: '20px',
        },
      }}>
      <AccordionSummary id={'local'}>
        <Box display={'flex'} alignItems={'center'} flex={1}>
          <div style={{ marginTop: '3px', paddingRight: '8px' }}>
            <Image src={extractProviderIcon(name)} alt={name} />
          </div>
          <Typography variant={'subtitle2'} sx={{ flex: 1 }}>
            {extractProviderName(name)}
          </Typography>

          <Typography
            variant={'subtitle2'}
            className={
              accProps.enabled
                ? clsx(classes.typography, classes.statusEnabled)
                : clsx(classes.typography, classes.statusDisabled)
            }>
            {accProps.enabled ? 'Enabled' : 'Disabled'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'rgb(217, 217, 217)' }}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
          width={'100%'}>
          <Box
            mb={2}
            maxWidth={800}
            display={'flex'}
            width={'100%'}
            flexDirection={'column'}
            gap={1}
            alignItems={'center'}>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'button'} sx={{ width: '100%' }}>
                {name !== 'phoneAuthentication'
                  ? `Allow users to sign up using their ${name} account.`
                  : `Allow users to sign up using their phone number.`}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={accProps.enabled}
                    onChange={() =>
                      setAccProps({
                        ...accProps,
                        enabled: !accProps.enabled,
                      })
                    }
                    value={'enabled'}
                    color="primary"
                  />
                }
                label={accProps.enabled ? 'Enabled' : 'Disabled'}
              />
            </Box>
            {accProps &&
              Object.entries(accProps).map(([key, value]) => {
                if (typeof value === 'boolean' && key !== 'enabled') {
                  return (
                    <Box
                      width={'100%'}
                      key={key}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'overline'} sx={{ width: '100%' }}>
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            name={key}
                            onChange={() =>
                              setAccProps({
                                ...accProps,
                                [key]: !value,
                              })
                            }
                            value={value}
                            color="primary"
                          />
                        }
                        label={value ? 'Enabled' : 'Disabled'}
                        disabled={!accProps.enabled || accProps?.identifier === 'username'}
                      />
                    </Box>
                  );
                }
              })}
            {accProps.identifier !== undefined ? (
              <Box width={'100%'} mt={2}>
                <Grid container item xs={8}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="identifier-label">Identifier</InputLabel>
                    <Select
                      id="identifier-id"
                      labelId="identifier-label"
                      name="identifier"
                      sx={{ width: '100%', marginBottom: 8 }}
                      value={accProps.identifier}
                      placeholder={'identifier'}
                      disabled={!accProps.enabled}
                      onChange={(e) =>
                        setAccProps({
                          ...accProps,
                          identifier: e.target.value,
                        })
                      }
                      label="Identifier">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={'email'}>email</MenuItem>
                      <MenuItem value={'username'}>username</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Box>
            ) : (
              ''
            )}
            {Object.entries(accProps).map(([key, value]) => {
              if (typeof value === 'string' && key !== 'identifier') {
                return (
                  <Box width={'100%'} mt={2} key={key}>
                    <Grid container item xs={8}>
                      <TextField
                        sx={{ width: '100%', marginBottom: 8 }}
                        id={key}
                        label={key
                          .split(/(?=[A-Z&])/)
                          .join(' ')
                          .replaceAll('_', ' ')}
                        name={key}
                        variant="outlined"
                        value={value}
                        onChange={(e) =>
                          setAccProps({
                            ...accProps,
                            [e.target.name]: e.target.value.replace(/\s/g, ''),
                          })
                        }
                        placeholder={key}
                        disabled={isFieldDisabled(key)}
                      />
                    </Grid>
                  </Box>
                );
              }
            })}
          </Box>
          <Box alignSelf={'flex-end'}>
            <Button onClick={() => handleCancel()} style={{ marginRight: 16 }} color={'primary'}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => handleSubmit(name, accProps)}>
              Save
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ReusableAccordion;
