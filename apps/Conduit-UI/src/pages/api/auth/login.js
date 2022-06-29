import { proxy } from '../../../server/proxy';

import Cookies from 'cookies';

const LOGIN_ENDPOINT_PATH = process.env.CONDUIT_URL;

export default (req, res) => {
  return new Promise((resolve, reject) => {
    console.log('/api/auth/login');
    // we're changing the url to our login endpoint without the /api prefix
    req.url = LOGIN_ENDPOINT_PATH + '/admin/login';

    /**
     * if an error occurs in the proxy, we will reject the promise.
     * it is so important. if you don't reject the promise,
     *  you're facing the stalled requests issue.
     */
    proxy.once('error', reject);

    proxy.once('proxyRes', (proxyRes, req, res) => {
      let body = [];

      console.log('CONDUIT res', res);

      proxyRes.on('data', (chunk) => body.push(chunk));

      // don't forget the catch the errors
      proxyRes.once('error', reject);

      proxyRes.on('end', () => {
        const isSuccess = proxyRes.statusCode === 200;

        if (isSuccess) {
          body = JSON.parse(Buffer.concat(body).toString());

          const cookies = new Cookies(req, res);
          cookies.set('authorization', body.accessToken, {
            httpOnly: true,
            sameSite: 'lax',
          });

          res.status(200).end();
        } else {
          res.status(proxyRes.statusCode).json(body);
        }

        /**
         * we are resolving the promise here for next.js to notify we've handled it.
         */
        resolve();
      });
    });

    proxy.web(req, res, {
      /**
       * it should be enable to handle proxy response via proxyRes event.
       */
      selfHandleResponse: true,
    });
  });
};

/**
 * In next.js's api routes, bodyParser is automatically enabled.
 * Since we are using the proxy, we need to disable it.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
