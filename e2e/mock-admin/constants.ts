export const MOCK_ADMIN_HOST = '127.0.0.1';
export const MOCK_ADMIN_PORT = 4010;
export const MOCK_ADMIN_ORIGIN = `http://${MOCK_ADMIN_HOST}:${MOCK_ADMIN_PORT}`;

export const E2E_MASTER_KEY = 'e2e-master-key';
export const E2E_USERNAME = 'admin';
export const E2E_PASSWORD = 'admin';
export const E2E_ENV_NAME = 'Local';
export const E2E_TEST_CONTROL_HEADER = 'x-conduit-e2e-control';
export const E2E_TEST_CONTROL_TOKEN = 'e2e-control-token';
export const JWT_SECRET = 'e2e-jwt-secret';

export const REDACTED_SECRET = '[REDACTED]';
export const STORED_API_KEY = 'sk-e2e-stored-key';
export const OPENAI_COMPATIBLE_PROVIDER = 'openai-compatible';
export const PROVIDER_ENDPOINT = 'https://api.openai.com/v1/embeddings';
export const PROVIDER_MODEL = 'text-embedding-3-small';
export const PROVIDER_DIMENSIONS = 1536;
export const SECOND_PROVIDER = 'voyage';
export const SECOND_PROVIDER_MODEL = 'voyage-3';
export const SECOND_PROVIDER_DIMENSIONS = 1024;

export const PRODUCT_SCHEMA_ID = 'schema_product';
export const PRODUCT_SCHEMA_NAME = 'Product';
export const ARCHIVED_SCHEMA_ID = 'schema_archived';
export const ARCHIVED_SCHEMA_NAME = 'ArchivedProduct';
export const CMS_ONLY_SCHEMA_ID = 'schema_cms_only';
export const CMS_ONLY_SCHEMA_NAME = 'CmsOnly';
export const COLLISION_SCHEMA_ID = 'schema_note';
export const COLLISION_SCHEMA_NAME = 'Note';
export const USER_SCHEMA_ID = 'schema_user';
export const USER_SCHEMA_NAME = 'User';
export const TEAM_SCHEMA_ID = 'schema_team';
export const TEAM_SCHEMA_NAME = 'Team';
export const ADMIN_SCHEMA_ID = 'schema_admin';
export const ADMIN_SCHEMA_NAME = 'Admin';
export const ADMIN_MIDDLEWARE_SCHEMA_ID = 'schema_admin_middleware';
export const ADMIN_MIDDLEWARE_SCHEMA_NAME = 'AdminMiddleware';
export const APP_MIDDLEWARE_SCHEMA_ID = 'schema_app_middleware';
export const APP_MIDDLEWARE_SCHEMA_NAME = 'AppMiddleware';
export const CLIENT_SCHEMA_ID = 'schema_client';
export const CLIENT_SCHEMA_NAME = 'Client';
export const CONFIG_SCHEMA_ID = 'schema_config';
export const CONFIG_SCHEMA_NAME = 'Config';
export const VIEWS_SCHEMA_ID = 'schema_views';
export const VIEWS_SCHEMA_NAME = 'Views';
export const DATABASE_SYSTEM_SCHEMAS = [
  '_DeclaredSchema',
  'MigratedSchemas',
  'CustomEndpoints',
  'PendingSchemas',
  'Views',
] as const;
export const READY_CONFIG_ID = 'cfg_product';
export const LEGACY_CONFIG_ID = 'cfg_legacy';
export const ACME_TEAM_ID = 'team_acme';
export const DOCS_CONTAINER_ID = 'ctr_docs';
export const DOCS_CONTAINER_NAME = 'docs';
export const INVOICES_FOLDER_NAME = 'invoices';
export const READY_STORAGE_SOURCE_ID = 'src_storage';
export const READY_EXTERNAL_SOURCE_ID = 'src_external';
export const LEGACY_MODEL = 'text-embedding-ada-002';
export const READY_INDEX_NAME = 'Product_embedding_v2';
export const PENDING_INDEX_NAME = 'Product_embedding_v1';

export const FIXED_NOW = '2026-01-15T12:00:00.000Z';
