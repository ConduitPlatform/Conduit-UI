import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  SocialNameTypes,
  IAuthenticationConfig,
  SignInTypes,
} from '../../models/authentication/AuthModels';
import ReusableAccordion from './SignInMethod';
import { useTheme } from '@mui/material';

interface Props {
  configData: IAuthenticationConfig;
  handleData: (type: SocialNameTypes, data: SignInTypes) => void;
}

const SignInContainer: React.FC<Props> = ({ configData, handleData, ...rest }) => {
  const theme = useTheme();
  const [local, setLocal] = useState<SignInTypes>({
    enabled: false,
    sendVerificationEmail: false,
    accountLinking: false,
    verificationRequired: false,
    verification_redirect_uri: '',
    forgot_password_redirect_uri: '',
  });

  const [google, setGoogle] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    OAuth2Flow: false,
    redirect_uri: '',
    clientSecret: '',
  });

  const [facebook, setFacebook] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    OAuth2Flow: false,
    redirect_uri: '',
    clientSecret: '',
  });

  const [slack, setSlack] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    redirect_uri: '',
    clientSecret: '',
  });

  const [github, setGithub] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    redirect_uri: '',
    clientSecret: '',
  });

  const [figma, setFigma] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    redirect_uri: '',
    clientSecret: '',
  });

  const [microsoft, setMicrosoft] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    redirect_uri: '',
    clientSecret: '',
  });

  const [twitch, setTwitch] = useState<SignInTypes>({
    enabled: false,
    accountLinking: false,
    clientId: '',
    redirect_uri: '',
    clientSecret: '',
  });

  const [phoneAuthentication, setPhoneAuthentication] = useState<{ enabled: boolean }>({
    enabled: false,
  });

  useEffect(() => {
    if (configData) {
      if (configData.local) {
        const localData = configData.local;
        setLocal({
          enabled: localData.enabled,
          sendVerificationEmail: localData.verification?.send_email ?? false,
          verificationRequired: localData.verification?.required ?? false,
          verification_redirect_uri: localData.verification?.redirect_uri ?? '',
          forgot_password_redirect_uri: localData.forgot_password_redirect_uri ?? '',
        });
      }
      if (configData.google) {
        const googleData = configData.google;

        setGoogle({
          enabled: googleData.enabled,
          accountLinking: googleData.accountLinking,
          clientId: googleData.clientId || '',
          OAuth2Flow: googleData.redirect_uri && googleData.clientSecret ? true : false,
          redirect_uri: googleData.redirect_uri || '',
          clientSecret: googleData.clientSecret || '',
        });
      }
      if (configData.facebook) {
        const facebookData = configData.facebook;

        setFacebook({
          enabled: facebookData.enabled,
          accountLinking: facebookData.accountLinking,
          OAuth2Flow: facebookData.redirect_uri && facebookData.clientSecret ? true : false,
          clientId: facebookData.clientId || '',
          redirect_uri: facebookData.redirect_uri || '',
          clientSecret: facebookData.clientSecret || '',
        });
      }
      if (configData.twitch) {
        const twitchData = configData.twitch;

        setTwitch({
          enabled: twitchData.enabled,
          accountLinking: twitchData.accountLinking,
          clientId: twitchData.clientId || '',
          redirect_uri: twitchData.redirect_uri || '',
          clientSecret: twitchData.clientSecret || '',
        });
      }

      if (configData.slack) {
        const slackData = configData.slack;

        setSlack({
          enabled: slackData.enabled,
          accountLinking: slackData.accountLinking,
          clientId: slackData.clientId || '',
          redirect_uri: slackData.redirect_uri || '',
          clientSecret: slackData.clientSecret || '',
        });
      }

      if (configData.figma) {
        const figmaData = configData.figma;

        setFigma({
          enabled: figmaData.enabled,
          accountLinking: figmaData.accountLinking,
          clientId: figmaData.clientId || '',
          redirect_uri: figmaData.redirect_uri || '',
          clientSecret: figmaData.clientSecret || '',
        });
      }

      if (configData.github) {
        const githubData = configData.github;

        setGithub({
          enabled: githubData.enabled,
          accountLinking: githubData.accountLinking,
          clientId: githubData.clientId || '',
          redirect_uri: githubData.redirect_uri || '',
          clientSecret: githubData.clientSecret || '',
        });
      }

      if (configData.microsoft) {
        const microsftData = configData.microsoft;

        setMicrosoft({
          enabled: microsftData.enabled,
          accountLinking: microsftData.accountLinking,
          clientId: microsftData.clientId || '',
          redirect_uri: microsftData.redirect_uri || '',
          clientSecret: microsftData.clientSecret || '',
        });
      }
      if (configData.phoneAuthentication) {
        const phoneData = configData.phoneAuthentication;
        setPhoneAuthentication({
          enabled: phoneData.enabled,
        });
      }
    }
  }, [configData]);

  const localMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'local'}
        accProps={local}
        setAccProps={setLocal}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [local, configData, handleData]);

  const googleMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'google'}
        accProps={google}
        setAccProps={setGoogle}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [google, configData, handleData]);

  const facebookMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'facebook'}
        accProps={facebook}
        setAccProps={setFacebook}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [facebook, configData, handleData]);

  const twitchMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'twitch'}
        accProps={twitch}
        setAccProps={setTwitch}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [twitch, configData, handleData]);

  const slackMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'slack'}
        accProps={slack}
        setAccProps={setSlack}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [slack, configData, handleData]);

  const figmaMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'figma'}
        accProps={figma}
        setAccProps={setFigma}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [figma, configData, handleData]);

  const githubMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'github'}
        accProps={github}
        setAccProps={setGithub}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [github, configData, handleData]);

  const microsoftMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'microsoft'}
        accProps={microsoft}
        setAccProps={setMicrosoft}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [microsoft, configData, handleData]);

  const phoneMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'phoneAuthentication'}
        accProps={phoneAuthentication}
        setAccProps={setPhoneAuthentication}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [phoneAuthentication, configData, handleData]);

  return (
    <Box sx={{ width: '100%', paddingBottom: '20px' }} {...rest}>
      <Box
        display={'flex'}
        alignItems={'center'}
        sx={{
          backgroundColor: theme.palette.primary.dark,
          height: 38,
          color: '#000',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
        boxShadow={2}>
        <Typography
          variant={'subtitle2'}
          sx={{ width: '50%', paddingLeft: 2 }}
          color="common.white">
          Provider
        </Typography>
        <Typography
          variant={'subtitle2'}
          sx={{ width: '50%', paddingLeft: 2 }}
          color="common.white">
          Status
        </Typography>
      </Box>
      {localMemo}
      {googleMemo}
      {facebookMemo}
      {twitchMemo}
      {slackMemo}
      {figmaMemo}
      {githubMemo}
      {microsoftMemo}
      {phoneMemo}
    </Box>
  );
};

export default SignInContainer;
