import { proxy, proxyLoki, proxyPrometheus } from '../../server/proxy';
import { NextApiRequest, NextApiResponse } from 'next';

const path = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    if (req.url?.match(/^\/api\/info/)) {
      res.status(200).json({
        logsAvailable: process.env.LOKI_URL && process.env.LOKI_URL.length > 0,
        metricsAvailable: !!(process.env.PROMETHEUS_URL && process.env.PROMETHEUS_URL.length > 0),
      });
      resolve({});
    } else if (req.url?.match(/^\/api\/loki/)) {
      req.url = req.url?.replace(/^\/api\/loki/, '');
      try {
        proxyLoki?.once('proxyRes', resolve).once('error', reject).web(req, res);
      } catch (e) {
        reject(e);
      }
    } else if (req.url?.match(/^\/api\/prometheus/)) {
      req.url = req.url?.replace(/^\/api\/prometheus/, '');
      try {
        proxyPrometheus?.once('proxyRes', resolve).once('error', reject).web(req, res);
      } catch (e) {
        reject(e);
      }
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
      try {
        proxy.once('proxyRes', resolve).once('error', reject).web(req, res);
      } catch (e) {
        reject(e);
      }
    }
  });
};
export default path;

export const config = {
  api: {
    bodyParser: false,
  },
};
