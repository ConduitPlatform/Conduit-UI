import strategyMap from '@/components/authentication/strategies/stategyMap.config';
import {
  REALM_SIMPLE_STRATEGY_KEYS,
  type RealmSimpleStrategyKey,
} from '@/lib/authentication/realms';
import { OAUTH_PROVIDER_KEYS, type OAuthProviderKey } from '@/lib/models/Realm';

export type RealmStrategyInfo = {
  name: string;
  description: string;
};

/** Realm strategy key -> key in the global `stategyMap.config.ts`. */
const GLOBAL_STRATEGY_KEY: Partial<Record<RealmSimpleStrategyKey, string>> = {
  local: 'local',
  magicLink: 'magic_link',
  phone: 'phoneAuthentication',
  biometric: 'biometricAuthentication',
};

/** Strategies the global strategy map has no entry for. */
const FALLBACK_INFO: Record<string, RealmStrategyInfo> = {
  username: {
    name: 'Username',
    description: 'Supports register/login with a username and password.',
  },
  metamask: {
    name: 'MetaMask',
    description: 'Supports register/login by signing with an Ethereum wallet.',
  },
  bitbucket: {
    name: 'Bitbucket',
    description: 'Supports register/login with Bitbucket accounts.',
  },
};

function resolve(
  realmKey: string,
  globalKey: string | undefined
): RealmStrategyInfo {
  const fromMap = globalKey ? strategyMap[globalKey] : undefined;
  if (fromMap) {
    return { name: fromMap.name, description: fromMap.description };
  }
  return FALLBACK_INFO[realmKey] ?? { name: realmKey, description: '' };
}

export const HOME_STRATEGIES: ReadonlyArray<
  { key: RealmSimpleStrategyKey } & RealmStrategyInfo
> = REALM_SIMPLE_STRATEGY_KEYS.map(key => ({
  key,
  ...resolve(key, GLOBAL_STRATEGY_KEY[key] ?? key),
}));

export const OAUTH_PROVIDERS: ReadonlyArray<
  { key: OAuthProviderKey } & RealmStrategyInfo
> = OAUTH_PROVIDER_KEYS.map(key => ({ key, ...resolve(key, key) }));
