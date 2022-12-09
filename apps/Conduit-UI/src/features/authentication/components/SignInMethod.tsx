import React, { useState } from 'react';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import { Button, InputLabel, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { IAuthenticationConfig, SignInTypes, SocialNameTypes } from '../models/AuthModels';
import { extractProviderIcon, extractProviderName } from '../../../utils/extractProviderUtils';
import Image from 'next/image';

interface Props {
  name: SocialNameTypes;
  setAccProps: any;
  handleData: (type: SocialNameTypes, data: SignInTypes) => void;
  configData: IAuthenticationConfig;
  accProps: SignInTypes;
}

const SignInMethod: React.FC<Props> = ({ setAccProps, name, handleData, configData, accProps }) => {
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
    setExpanded(false);
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

  const extractHeader = (name: string) => {
    if (name === 'phoneAuthentication') {
      return `Allow users to sign in using their ${name} account.`;
    } else if (name === 'twoFa') {
      return 'Allow users to sign in using two factor authentication';
    } else if (name === 'magic_link') {
      return 'Allow users to sign in using a magic link';
    } else return `Allow users to sign in using their ${name} account.`;
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
            sx={
              accProps.enabled
                ? { flex: 1, color: 'primary.main' }
                : { flex: 1, color: 'primary.main' }
            }>
            {accProps.enabled ? (
              <Typography variant="caption">Enabled</Typography>
            ) : (
              <Typography variant="caption" color="error">
                Disabled
              </Typography>
            )}
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
                {extractHeader(name)}
              </Typography>
              <FormControlLabel
                sx={{
                  '&.MuiFormControlLabel-root': {
                    '&.MuiFormControlLabel-labelPlacementStart': {
                      '&	.MuiFormControlLabel-label': {
                        mr: 2,
                      },
                    },
                  },
                }}
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
                labelPlacement="start"
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
                        sx={{
                          '&.MuiFormControlLabel-root': {
                            '&.MuiFormControlLabel-labelPlacementStart': {
                              '&	.MuiFormControlLabel-label': {
                                mr: 2,
                              },
                            },
                          },
                        }}
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
                        labelPlacement="start"
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
                      sx={{ width: '100%', marginBottom: 2, borderRadius: 2 }}
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
                  <Box width={'100%'} key={key}>
                    <Grid container item xs={8}>
                      <TextField
                        sx={{ width: '100%', mb: 3 }}
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
            <Button
              onClick={() => handleCancel()}
              style={{ marginRight: 16 }}
              color={'primary'}
              variant="outlined">
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

export default SignInMethod;
