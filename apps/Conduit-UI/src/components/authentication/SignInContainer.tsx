import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  SocialNameTypes,
  IAuthenticationConfig,
  SignInTypes,
} from '../../models/authentication/AuthModels';
import ReusableAccordion from './SignInMethod';
import { Button, Icon, useTheme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { ConduitTooltip } from '@conduitplatform/ui-components';

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

  const [gitlab, setGitlab] = useState<SignInTypes>({
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

  const [twoFa, setTwoFa] = useState<SignInTypes>({
    enabled: false,
    authenticator: false,
    sms: false,
  });

  const [magic_link, setMagicLink] = useState<SignInTypes>({
    enabled: false,
    redirect_uri: '',
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

        setGitlab({
          enabled: githubData.enabled,
          accountLinking: githubData.accountLinking,
          clientId: githubData.clientId || '',
          redirect_uri: githubData.redirect_uri || '',
          clientSecret: githubData.clientSecret || '',
        });
      }

      if (configData.gitlab) {
        const gitlabData = configData.gitlab;
        setGithub({
          enabled: gitlabData.enabled,
          accountLinking: gitlabData.accountLinking,
          clientId: gitlabData.clientId || '',
          redirect_uri: gitlabData.redirect_uri || '',
          clientSecret: gitlabData.clientSecret || '',
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
      if (configData.twoFa) {
        const twoFa = configData.twoFa;

        setTwoFa({
          enabled: twoFa.enabled ?? false,
          authenticator: twoFa.methods?.authenticator ?? false,
          sms: twoFa.methods?.sms ?? false,
        });
      }
      if (configData.magic_link) {
        const magicLinkData = configData.magic_link;
        setMagicLink({
          enabled: magicLinkData.enabled ?? false,
          redirect_uri: magicLinkData.redirect_uri ?? '',
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

  const gitlabMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'gitlab'}
        accProps={gitlab}
        setAccProps={setGitlab}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [gitlab, configData, handleData]);

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

  const twoFaMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'twoFa'}
        accProps={twoFa}
        setAccProps={setTwoFa}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [twoFa, configData, handleData]);

  const magicLinkMemo = useMemo(() => {
    return (
      <ReusableAccordion
        name={'magic_link'}
        accProps={magic_link}
        setAccProps={setMagicLink}
        configData={configData}
        handleData={handleData}
      />
    );
  }, [magic_link, configData, handleData]);

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
        <Box sx={{ width: '50%', paddingLeft: 2 }} display="flex" alignItems="center" gap={2}>
          <Typography variant={'subtitle2'} color="common.white">
            Provider
          </Typography>
          <Box>
            <ConduitTooltip
              title={
                <Box display="flex" flexDirection="column" gap={2} p={2}>
                  <Typography variant="body2">
                    The Authentication module supports multiple user authentication strategies. It
                    supports local credential-based logins, while also providing integration for a
                    plethora of third party providers through 0Auth2. Two-Factor cellular
                    authentication is supported across any strategy. Local Authentication is enabled
                    out of the box.
                  </Typography>
                  <Typography variant="body2">Tutorials</Typography>
                  <Box display="flex" gap={2}>
                    <Box>
                      <a
                        href="https://getconduit.dev/docs/modules/authentication/tutorials/local"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Local</Button>
                      </a>
                    </Box>
                    <Box>
                      <a
                        href="https://getconduit.dev/docs/modules/authentication/tutorials/facebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Facebook</Button>
                      </a>
                    </Box>
                    <Box>
                      <a
                        href="https://getconduit.dev/docs/modules/authentication/tutorials/google"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Google</Button>
                      </a>
                    </Box>
                  </Box>
                </Box>
              }>
              <Icon sx={{ color: 'common.white' }}>
                <InfoOutlined />
              </Icon>
            </ConduitTooltip>
          </Box>
        </Box>
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
      {gitlabMemo}
      {microsoftMemo}
      {phoneMemo}
      {twoFaMemo}
      {magicLinkMemo}
    </Box>
  );
};

export default SignInContainer;
