import { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';
import { isEmpty, isNil } from 'lodash';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};
export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve, reject) => {
    const proxy: httpProxy = httpProxy.createProxy();
    const prometheusAvailable =
      !isNil(process.env.PROMETHEUS_URL) && !isEmpty(process.env.PROMETHEUS_URL);
    const lokiAvailable = !isNil(process.env.LOKI_URL) && !isEmpty(process.env.LOKI_URL);
    let requestData;
    if (req.url?.match(/^\/api\/info/)) {
      res.status(200).json({
        logsAvailable: lokiAvailable,
        metricsAvailable: prometheusAvailable,
      });
      return resolve({});
    } else if (req.url?.match(/^\/api\/loki/)) {
      req.url = req.url?.replace(/^\/api\/loki/, '');
      if (!lokiAvailable) {
        res.status(500).json({ error: 'Loki URL is not set' });
        return resolve({});
      }
      requestData = {
        timeout: 5000,
        changeOrigin: true,
        autoRewrite: false,
        target: process.env.LOKI_URL,
      };
    } else if (req.url?.match(/^\/api\/prometheus/)) {
      if (!prometheusAvailable) {
        res.status(500).json({ error: 'Prometheus URL is not set' });
        return resolve({});
      }
      req.url = req.url?.replace(/^\/api\/prometheus/, '');
      requestData = {
        timeout: 5000,
        changeOrigin: true,
        autoRewrite: false,
        target: process.env.PROMETHEUS_URL,
      };
    } else {
      // removes the api prefix from url
      req.url = req.url?.replace(/^\/api/, '');

      // add masterkey since the initial req does not include
      // it for security measures
      req.headers.masterkey = process.env.MASTER_KEY;

      // const cookies = new Cookies(req, res);
      // const authorization = cookies.get('authorization');
      //
      // // don't forwards the cookies to the target server
      // req.headers.cookie = '';
      //
      // if (authorization) {
      //   req.headers.authorization = authorization;
      // }
      requestData = {
        timeout: 10000,
        changeOrigin: true,
        autoRewrite: false,
        target: process.env.CONDUIT_URL,
      };
    }
    try {
      proxy.once('proxyRes', resolve).once('error', reject).web(req, res, requestData);
    } catch (e) {
      console.log(e);
    }
  }).catch((error) => {
    console.log('Caught error: ', error?.message ?? 'Something went wrong');
    res.status(500).json({ error: error?.message ?? 'Something went wrong' });
  });
