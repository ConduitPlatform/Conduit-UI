export type StorageSettings = {
  active: boolean,
  provider: string,
  storagePath: string,
  authorization: AuthorizationProps,
  defaultContainer: string,
  allowContainerCreation: boolean,
  google: GoogleSettings,
  azure: AzureSettings,
  aws: AwsSettings,
  aliyun: Aliyub,
  local: LocalSettings
}

type AuthorizationProps = {
  enabled:boolean,
}

type GoogleSettings = {
  serviceAccountKeyPath: string,
  bucketName: string
}

type AzureSettings = {
  connectionString: string,
}

type AwsSettings = {
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  accountId: string,
  endpoint?: string
}
type Aliyub = {
  region: string,
  accessKeyId: string,
  accessKeySecret: string
}
type LocalSettings = {
  storagePath: string
}