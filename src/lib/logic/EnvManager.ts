'use server';

import { isEmpty } from 'lodash';
import { cookies } from 'next/headers';

export const getEnvs = async () => {
  let environments: {
    name: string;
    baseUrl: string;
    masterKey: string;
    lokiUrl?: string;
    promUrl?: string;
    namespace?: string;
  }[];
  if (isEmpty(process.env.ENVIRONMENTS)) {
    const baseUrl = process.env.API_BASE_URL!;
    const masterKey = process.env.MASTER_KEY!;
    const lokiUrl = process.env.LOKI_URL;
    const promUrl = process.env.PROMETHEUS_URL;
    const namespace = process.env.NAMESPACE;
    environments = [
      {
        name: 'Local',
        baseUrl,
        masterKey,
        lokiUrl,
        promUrl,
        namespace,
      },
    ];
  } else {
    if (typeof process.env.ENVIRONMENTS !== 'string') {
      throw new Error('Invalid environments format');
    }
    const parseEnvs = JSON.parse(process.env.ENVIRONMENTS.replaceAll(' ', ''));
    environments = [];
    Object.keys(parseEnvs).forEach(key => {
      environments.push({
        name: key,
        baseUrl: parseEnvs[key].baseUrl,
        masterKey: parseEnvs[key].masterKey,
        lokiUrl: parseEnvs[key].lokiUrl,
        promUrl: parseEnvs[key].promUrl,
        namespace: parseEnvs[key].namespace,
      });
    });
  }

  return environments;
};

export const getEnv = async (env?: string) => {
  let _env = env;
  if (!_env) {
    const cookie = await cookies().get('activeEnv');
    if (cookie) {
      _env = cookie.value;
    } else {
      _env = 'Local';
    }
  }
  return getEnvs().then(environments => {
    const envs = environments.filter(e => e.name === _env);
    if (envs.length === 0) {
      throw new Error('Environment not found');
    }
    return envs[0];
  });
};
