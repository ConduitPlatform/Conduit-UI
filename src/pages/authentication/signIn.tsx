import Typography from '@material-ui/core/Typography';
import React, { ReactElement, useEffect } from 'react';
import { SignInTypes, SocialNameTypes } from '../../models/authentication/AuthModels';
import {
  asyncGetAuthenticationConfig,
  asyncUpdateAuthenticationConfig,
} from '../../redux/slices/authenticationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import AuthAccordion from '../../components/authentication/AuthAccordion';

const SignIn = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.authenticationSlice.data);

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  const handleConfigChange = (type: SocialNameTypes, newValue: SignInTypes) => {
    if (newValue.nativeFlow === true) {
      delete newValue.nativeFlow;
    } else if (newValue.nativeFlow === false) {
      delete newValue.nativeFlow;
      delete newValue.redirect_uri;
      delete newValue.clientSecret;
    }
    const data = {
      ...config,
      [type]: {
        ...newValue,
      },
    };

    dispatch(asyncUpdateAuthenticationConfig(data));
  };

  return (
    <div>
      {config ? (
        <AuthAccordion configData={config} handleData={handleConfigChange} />
      ) : (
        <Typography>No config available</Typography>
      )}
    </div>
  );
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
