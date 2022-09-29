import React from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../components/common/LoaderComponent';

const Login = dynamic(() => import('../components/login/Login'), {
  loading: () => <LoaderComponent />,
});

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;
