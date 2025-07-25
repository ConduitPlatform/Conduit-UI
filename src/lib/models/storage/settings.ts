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
};

type AuthorizationProps = {
  enabled: boolean;
};

type GoogleSettings = {
  serviceAccountKeyPath: string;
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
