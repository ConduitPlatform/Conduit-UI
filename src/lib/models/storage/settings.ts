export type StorageProvider = 'google' | 'azure' | 'aws' | 'aliyun' | 'local';

export type StorageSettings = {
  active: boolean;
  provider: StorageProvider;
  authorization: AuthorizationProps;
  defaultContainer: string;
  allowContainerCreation: boolean;
  google: GoogleSettings;
  azure: AzureSettings;
  aws: AwsSettings;
  aliyun: Aliyun;
  local: LocalSettings;
  suffixOnNameConflict?: boolean;
  /** Absent on servers that do not support a configurable write rate limit. */
  rateLimits?: StorageRateLimits;
};

export type StorageRateLimit = {
  /** Maximum requests per client IP within resetInterval. */
  maxRequests: number;
  /** Window of the limit, in seconds. */
  resetInterval: number;
};

type StorageRateLimits = {
  write: StorageRateLimit;
};

type AuthorizationProps = {
  enabled: boolean;
};

type GoogleSettings = {
  serviceAccountKeyPath: string;
  serviceAccountKeyJson: string;
};

type AzureSettings = {
  connectionString: string;
};

type AwsSettings = {
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  accountId?: string;
  endpoint?: string;
  usePathStyle?: boolean;
};

type Aliyun = {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
};

type LocalSettings = {
  storagePath: string;
};
