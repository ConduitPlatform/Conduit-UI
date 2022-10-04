const { PHASE_PRODUCTION_BUILD } = require('next/constants');
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  // when started in development mode `next dev` or `npm run dev`
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // when `next build` or `npm run build` is used
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    IS_DEV: isDev,
    IS_PROD: isProd,
  };

  const publicRuntimeConfig = {
    CONDUIT_URL: process.env.CONDUIT_URL,
  };

  const serverRuntimeConfig = {
    MASTER_KEY: process.env.MASTER_KEY,
  };

  const redirects = async () => {
    return [
      {
        source: '/authentication',
        destination: '/authentication/dashboard',
        permanent: true,
      },
      {
        source: '/email',
        destination: '/email/dashboard',
        permanent: true,
      },
      {
        source: '/database',
        destination: '/database/dashboard',
        permanent: true,
      },
      {
        source: '/storage',
        destination: '/storage/dashboard',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/settings/settings',
        permanent: true,
      },
      {
        source: '/push-notifications',
        destination: '/push-notifications/dashboard',
        permanent: true,
      },
      {
        source: '/router',
        destination: '/router/dashboard',
        permanent: true,
      },
      {
        source: '/forms',
        destination: '/forms/dashboard',
        permanent: true,
      },
      {
        source: '/sms',
        destination: '/sms/dashboard',
        permanent: true,
      },
      {
        source: '/payments',
        destination: '/payments/dashboard',
        permanent: true,
      },
      {
        source: '/chat',
        destination: '/chat/dashboard',
        permanent: true,
      },
    ];
  };

  const eslint = {
    ignoreDuringBuilds: false,
  };

  return {
    env,
    publicRuntimeConfig,
    serverRuntimeConfig,
    redirects,
    eslint,
  };
};
