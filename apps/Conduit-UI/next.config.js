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

  const serverRuntimeConfig = {
    // Will only be available on the server side
    CONDUIT_URL: process.env.CONDUIT_URL,
    MASTER_KEY: process.env.MASTER_KEY,
  };

  const redirects = async () => {
    return [
      {
        source: '/authentication',
        destination: '/authentication/users',
        permanent: true,
      },
      {
        source: '/email',
        destination: '/email/templates',
        permanent: true,
      },
      {
        source: '/database',
        destination: '/database/schemas',
        permanent: true,
      },
      {
        source: '/storage',
        destination: '/storage/files',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/settings/clientsdk',
        permanent: true,
      },
      {
        source: '/push-notifications',
        destination: '/push-notifications/send',
        permanent: true,
      },
      {
        source: '/forms',
        destination: '/forms/view',
        permanent: true,
      },
      {
        source: '/sms',
        destination: '/sms/send',
        permanent: true,
      },
      {
        source: '/payments',
        destination: '/payments/customers',
        permanent: true,
      },
      {
        source: '/chat',
        destination: '/chat/rooms',
        permanent: true,
      },
    ];
  };

  const eslint = {
    ignoreDuringBuilds: false,
  };

  return {
    env,
    serverRuntimeConfig,
    redirects,
    eslint,
  };
};
